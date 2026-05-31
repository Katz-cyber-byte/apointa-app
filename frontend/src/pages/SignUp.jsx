import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { CONFIG } from '../config';

const SignUp = () => {
    const [form, setForm] = useState({ email: '', password: '', business_name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false); // 1. State goes at the TOP
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        
        // extra safety check
        if(!agreed) return alert("Please agree to the terms.");

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
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4 font-sans text-[#0A2540]">
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

                        {/* 2. CONSENT CHECKBOX (Correctly placed inside the form) */}
                        <div className="flex items-start gap-3 mt-2">
                            <input 
                                required 
                                type="checkbox" 
                                id="agree"
                                className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2F80FF] focus:ring-[#2F80FF]" 
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                            />
                            <label htmlFor="agree" className="text-[11px] text-slate-500 leading-tight">
                                I agree to the <Link to="/terms" target="_blank" className="text-[#2F80FF] font-bold">Terms</Link> and acknowledge the <Link to="/privacy" target="_blank" className="text-[#2F80FF] font-bold">Privacy Policy</Link> (POPIA compliant).
                            </label>
                        </div>

                        {/* 3. SUBMIT BUTTON (Disabled logic included) */}
                        <button 
                            disabled={isLoading || !agreed}
                            className={`w-full py-3.5 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-4 
                                ${(!agreed || isLoading) 
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                    : 'bg-[#0A2540] text-white hover:bg-[#1a365d]'}`}
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