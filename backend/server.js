const express = require('express');
const { Pool } = require('pg'); // PostgreSQL for Supabase
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit'); 
const { body, validationResult } = require('express-validator'); 
const app = express();

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "apointa_super_secret_key_2025";

// --- 1. MIDDLEWARE ---
app.use(helmet()); 
app.use(cors());
app.use(express.json());

// Rate limiter: 100 requests per 15 mins for general, 10 for login
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

// --- 2. DATABASE (Supabase Ready) ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// --- 3. SECURITY GUARD (JWT Verification) ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.status(401).json({ error: "Access Denied" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Session expired" });
        req.userId = user.id; 
        next();
    });
};

// --- 4. AUTH ROUTES ---

app.post('/api/signup', async (req, res) => {
    const { email, password, business_name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const slug = business_name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        await pool.query(
            "INSERT INTO users (email, password, business_name, slug, availability) VALUES ($1, $2, $3, $4, $5)",
            [email, hashedPassword, business_name, slug, '{}']
        );
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: "Email or Business name already taken." });
    }
});

app.post('/api/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ 
            token: token, 
            business_name: user.business_name, 
            slug: user.slug, 
            availability: JSON.parse(user.availability || '{}') 
        });
    } catch (e) { res.status(500).json({ error: "Login error" }); }
});

// --- 5. PROTECTED MERCHANT ROUTES (Used 'authenticateToken' here) ---

app.get('/api/bookings', authenticateToken, async (req, res) => {
    const result = await pool.query(
        "SELECT bookings.*, services.name as service_name FROM bookings LEFT JOIN services ON bookings.service_id = services.id WHERE bookings.user_id = $1 ORDER BY date ASC, time ASC",
        [req.userId]
    );
    res.json(result.rows);
});

app.get('/api/services', authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT * FROM services WHERE user_id = $1", [req.userId]);
    res.json(result.rows);
});

app.post('/api/services', authenticateToken, async (req, res) => {
    const { name, price, duration } = req.body;
    await pool.query("INSERT INTO services (user_id, name, price, duration) VALUES ($1, $2, $3, $4)", [req.userId, name, price, duration]);
    res.json({ success: true });
});

// --- 6. PUBLIC ROUTES (Sanitized) ---

app.post('/api/bookings/public', [
    body('customer_name').trim().escape(),
    body('notes').trim().escape(),
    body('customer_phone').isLength({ min: 10 }).trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: "Invalid input" });

    const { slug, customer_name, customer_email, customer_phone, notes, service_id, date, time } = req.body;
    try {
        const userRes = await pool.query("SELECT id FROM users WHERE slug = $1", [slug.toLowerCase()]);
        const user = userRes.rows[0];
        if (!user) return res.status(404).json({ error: "Business not found" });

        await pool.query(
            "INSERT INTO bookings (user_id, customer_name, customer_email, customer_phone, notes, service_id, date, time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [user.id, customer_name, customer_email, customer_phone, notes, service_id, date, time]
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Booking failed" }); }
});

app.get('/api/public/business-info/:slug', async (req, res) => {
    const userRes = await pool.query("SELECT id, business_name, availability FROM users WHERE slug = $1", [req.params.slug.toLowerCase()]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).send();

    const services = await pool.query("SELECT * FROM services WHERE user_id = $1", [user.id]);
    const bookings = await pool.query("SELECT date, time FROM bookings WHERE user_id = $1", [user.id]);

    res.json({ 
        user: { ...user, availability: JSON.parse(user.availability || '{}') }, 
        services: services.rows, 
        bookedSlots: bookings.rows 
    });
});

app.listen(PORT, () => console.log(`🚀 Secure Apointa Engine Live on ${PORT}`));