import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CONFIG } from '../config';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    // 1. Clear everything first to prevent ID mixing
    localStorage.clear(); 

    try {
        const res = await fetch(`${CONFIG.API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok && data.token) {
            // 2. Save fresh data
            localStorage.setItem(CONFIG.ADMIN_TOKEN_KEY, data.token);
            localStorage.setItem('slug', data.slug);
            localStorage.setItem('business_name', data.business_name);
            localStorage.setItem('open_time', data.open_time);
            localStorage.setItem('close_time', data.close_time);
            
            navigate('/admin');
        } else {
            alert(data.error || "Login Failed");
        }
    } catch (err) {
        alert("Server error. check port 5001");
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4 font-sans">
            <div className="max-w-md w-full">
                {/* Branding */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-10 h-10 bg-[#2F80FF] rounded-lg mb-3 flex items-center justify-center font-bold text-white italic shadow-sm">
                        A
                    </div>
                    <h1 className="text-2xl font-bold text-[#0A2540]">Sign in to Schedinary</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your business appointments</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg font-medium text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                                Email Address
                            </label>
                            <input 
                                required 
                                type="email" 
                                placeholder="name@company.com" 
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF] focus:ring-4 focus:ring-[#2F80FF]/10 text-[#0A2540] transition-all" 
                                onChange={e => setEmail(e.target.value)} 
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5 ml-1">
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                    Password
                                </label>
                            </div>
                            <input 
                                required 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF] focus:ring-4 focus:ring-[#2F80FF]/10 text-[#0A2540] transition-all" 
                                onChange={e => setPassword(e.target.value)} 
                            />
                        </div>

                        <button 
                            disabled={isLoading}
                            className={`w-full bg-[#0A2540] text-white py-3 rounded-lg font-bold shadow-sm hover:bg-[#1a365d] transition-all flex items-center justify-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Connecting...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Footer Link */}
                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#2F80FF] font-bold hover:underline">
                        Get started for free
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;