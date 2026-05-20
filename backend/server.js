const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "apointa_secret_2025";

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// --- SECURITY MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Forbidden" });
        req.userId = user.id;
        next();
    });
};

// --- AUTH ROUTES ---
app.post('/api/signup', async (req, res) => {
    const { email, password, business_name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const slug = business_name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const defaultHours = JSON.stringify({
            0: { open: false, start: "09:00", end: "17:00" },
            1: { open: true,  start: "09:00", end: "17:00" },
            2: { open: true,  start: "09:00", end: "17:00" },
            3: { open: true,  start: "09:00", end: "17:00" },
            4: { open: true,  start: "09:00", end: "17:00" },
            5: { open: true,  start: "09:00", end: "17:00" },
            6: { open: true,  start: "09:00", end: "16:00" }
        });
        await pool.query("INSERT INTO users (email, password, business_name, slug, availability) VALUES ($1, $2, $3, $4, $5)", [email, hashedPassword, business_name, slug, defaultHours]);
        res.json({ success: true });
    } catch (e) { res.status(400).json({ error: "Business name or email taken" }); }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: user.id }, JWT_SECRET);
        res.json({ token, business_name: user.business_name, slug: user.slug, availability: JSON.parse(user.availability) });
    } catch (e) { res.status(500).json({ error: "Login failed" }); }
});

// --- MERCHANT ROUTES ---
app.get('/api/profile', authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT business_name, slug, availability FROM users WHERE id = $1", [req.userId]);
    const user = result.rows[0];
    res.json({ ...user, availability: JSON.parse(user.availability) });
});

app.patch('/api/settings', authenticateToken, async (req, res) => {
    await pool.query("UPDATE users SET availability = $1 WHERE id = $2", [JSON.stringify(req.body.availability), req.userId]);
    res.json({ success: true });
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

app.get('/api/bookings', authenticateToken, async (req, res) => {
    const result = await pool.query("SELECT bookings.*, services.name as service_name FROM bookings LEFT JOIN services ON bookings.service_id = services.id WHERE bookings.user_id = $1 ORDER BY date ASC, time ASC", [req.userId]);
    res.json(result.rows);
});

// --- PUBLIC ROUTES ---
app.get('/api/public/business-info/:slug', async (req, res) => {
    try {
        const userRes = await pool.query("SELECT id, business_name, availability FROM users WHERE slug = $1", [req.params.slug.toLowerCase()]);
        const user = userRes.rows[0];
        if (!user) return res.status(404).json({ error: "Not found" });
        const services = await pool.query("SELECT * FROM services WHERE user_id = $1", [user.id]);
        const bookings = await pool.query("SELECT date, time FROM bookings WHERE user_id = $1", [user.id]);
        res.json({ user: { ...user, availability: JSON.parse(user.availability) }, services: services.rows, bookedSlots: bookings.rows });
    } catch (e) { res.status(500).json({ error: "Server Error" }); }
});

app.post('/api/bookings/public', async (req, res) => {
    const { slug, customer_name, customer_email, customer_phone, notes, service_id, date, time } = req.body;
    const userRes = await pool.query("SELECT id FROM users WHERE slug = $1", [slug.toLowerCase()]);
    const user = userRes.rows[0];
    await pool.query("INSERT INTO bookings (user_id, customer_name, customer_email, customer_phone, notes, service_id, date, time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)", [user.id, customer_name, customer_email, customer_phone, notes, service_id, date, time]);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Apointa Engine Live` ));