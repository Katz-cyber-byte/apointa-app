import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ShieldCheck } from 'lucide-react';
import { CONFIG } from '../config';

const SignUp = () => {
    const [form, setForm] = useState({ email: '', password: '', business_name: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        if(!agreed) return;
        setIsLoading(true);

        try {
            const res = await fetch(`${CONFIG.API_BASE_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                alert("Account created! Welcome to Schedinary.");
                navigate('/login');
            } else {
                alert("This name or email is already taken.");
            }
        } catch (err) {
            alert("Connection error.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] p-4 font-sans text-[#0A2540]">
            <div className="max-w-md w-full">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#2F80FF] rounded-xl mb-4 flex items-center justify-center font-black text-white italic shadow-lg">S</div>
                    <h1 className="text-2xl font-bold">Join Schedinary</h1>
                    <p className="text-slate-500 text-sm mt-1 text-center">Set up your merchant account.</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSignUp} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Business Name</label>
                            <input required className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF]" onChange={e => setForm({...form, business_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Email</label>
                            <input required type="email" className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF]" onChange={e => setForm({...form, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 ml-1">Password</label>
                            <input required type="password" className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-[#2F80FF]" onChange={e => setForm({...form, password: e.target.value})} />
                        </div>

                        <div className="flex items-start gap-3 mt-2">
                            <input required type="checkbox" id="agree" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-slate-300 text-[#2F80FF]" />
                            <label htmlFor="agree" className="text-xs text-slate-500 leading-tight">
                                I agree to the <Link to="/terms" target="_blank" className="text-[#2F80FF] font-bold">Terms</Link> and <Link to="/privacy" target="_blank" className="text-[#2F80FF] font-bold">Privacy Policy</Link>.
                            </label>
                        </div>

                        <button disabled={isLoading || !agreed} className={`w-full py-3.5 rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 mt-4 ${(!agreed || isLoading) ? 'bg-slate-200 text-slate-400' : 'bg-[#0A2540] text-white hover:bg-[#1a365d]'}`}>
                            <ShieldCheck size={18} /> {isLoading ? 'Processing...' : 'Create Account'}
                        </button>
                    </form>
                </div>
                <p className="text-center mt-8 text-sm text-slate-500">Already a member? <Link to="/login" className="text-[#2F80FF] font-bold">Sign In</Link></p>
            </div>
        </div>
    );
};

export default SignUp;