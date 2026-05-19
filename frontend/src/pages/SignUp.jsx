import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { CONFIG } from '../config';

const SignUp = () => {
    const [form, setForm] = useState({ email: '', password: '', business_name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // FIXED: Wrapped the logic in a proper async function
    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    business_name: form.business_name
                })
            });

            if (res.ok) {
                alert("Account created successfully! Please sign in.");
                navigate('/login');
            } else {
                const data = await res.json();
                alert(data.error || "Signup failed. Try a different business name.");
            }
        } catch (err) {
            alert("Connection error. Is your backend running on port 5001?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4 font-sans">
            <div className="max-w-md w-full">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#2F80FF] rounded-xl mb-4 flex items-center justify-center font-black text-white italic shadow-lg shadow-[#2F80FF]/20">
                        A
                    </div>
                    <h1 className="text-2xl font-bold text-[#0A2540]">Join Apointa</h1>
                    <p className="text-slate-500 text-sm mt-1 text-center">Set up your merchant account in 60 seconds.</p>
                </div>

                {/* Form Card */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSignUp} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Business Name
                            </label>
                            <input 
                                required 
                                placeholder="e.g. Luxury Hair Studio" 
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF] focus:ring-4 focus:ring-[#2F80FF]/10 text-[#0A2540] transition-all" 
                                onChange={e => setForm({...form, business_name: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Email Address
                            </label>
                            <input 
                                required 
                                type="email" 
                                placeholder="admin@business.com" 
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF] focus:ring-4 focus:ring-[#2F80FF]/10 text-[#0A2540] transition-all" 
                                onChange={e => setForm({...form, email: e.target.value})} 
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                                Password
                            </label>
                            <input 
                                required 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF] focus:ring-4 focus:ring-[#2F80FF]/10 text-[#0A2540] transition-all" 
                                onChange={e => setForm({...form, password: e.target.value})} 
                            />
                        </div>

                        <button 
                            disabled={isLoading}
                            className={`w-full bg-[#0A2540] text-white py-3.5 rounded-lg font-bold shadow-md hover:bg-[#1a365d] transition-all flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <ShieldCheck size={18} />
                            {isLoading ? 'Creating Account...' : 'Create Merchant Account'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                    Already a member?{' '}
                    <Link to="/login" className="text-[#2F80FF] font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;