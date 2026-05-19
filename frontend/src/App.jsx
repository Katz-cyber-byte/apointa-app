import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import CustomerBooking from './pages/CustomerBooking';
import { CONFIG } from './config'; // Import the config

const ProtectedRoute = ({ children }) => {
    // We check for the SPECIFIC key defined in config.js
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
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                
                <Route 
                    path="/admin" 
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />

                <Route path="/book/:businessSlug" element={<CustomerBooking />} />
                <Route path="/" element={<Navigate to="/signup" />} />
            </Routes>
        </Router>
    );
}

export default App;