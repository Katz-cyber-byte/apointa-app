import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CustomerBooking from './pages/CustomerBooking';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import { CONFIG } from './config';

// Security check component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem(CONFIG.ADMIN_TOKEN_KEY);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Auth Routes */}
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                
                {/* Legal Pages */}
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                {/* Protected Admin Route */}
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />

                {/* Public Booking Link */}
                <Route path="/book/:businessSlug" element={<CustomerBooking />} />

                {/* Default Redirect to Signup */}
                <Route path="/" element={<Navigate to="/signup" replace />} />
            </Routes>
        </Router>
    );
}

export default App;