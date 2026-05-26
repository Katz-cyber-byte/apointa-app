import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Clock, ShieldCheck, ChevronLeft, ChevronRight, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { CONFIG } from '../config';

const CustomerBooking = () => {
    const { businessSlug } = useParams(); 
    const [bizInfo, setBizInfo] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ customer_name: '', email: '', customer_phone: '', notes: '', date: '', time: '' });
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [loading, setLoading] = useState(true);

    const [viewDate, setViewDate] = useState(new Date()); 
    const today = new Date();
    today.setHours(0,0,0,0);

    useEffect(() => {
        if (!businessSlug) return;
        setLoading(true);
        fetch(`${CONFIG.API_BASE_URL}/public/business-info/${businessSlug.toLowerCase().trim()}`)
            .then(res => res.json())
            .then(data => { 
                setBizInfo(data); 
                setLoading(false); 
            })
            .catch(() => setLoading(false));
    }, [businessSlug]);

    // --- CALENDAR LOGIC (FIXED FOR DATE SHIFT) ---
    const generateCalendar = () => {
        if (!bizInfo?.user?.availability) return [];
        
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ type: 'empty' });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            
            // THE FIX: We build the date string manually from the numbers (YYYY-MM-DD)
            // This prevents the "Timezone Shift" because we aren't using .toISOString()
            const yearStr = year;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(d).padStart(2, '0');
            const fullDateString = `${yearStr}-${monthStr}-${dayStr}`; 
            
            const isPast = dateObj < today;
            const isClosed = !bizInfo.user.availability[dateObj.getDay()]?.open;
            
            days.push({
                day: d,
                fullDate: fullDateString,
                disabled: isPast || isClosed,
                type: 'day'
            });
        }
        return days;
    };

    const getAvailableSlots = () => {
        if (!bizInfo?.user || !formData.date) return [];
        
        // Find day of week from our string date safely
        const [y, m, d] = formData.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayOfWeek = dateObj.getDay();
        
        const daySettings = bizInfo.user.availability[dayOfWeek];
        if (!daySettings || !daySettings.open) return [];

        const startH = parseInt(daySettings.start.split(':')[0]);
        const endH = parseInt(daySettings.end.split(':')[0]);
        
        let slots = [];
        for (let i = startH; i < endH; i++) {
            const timeStr = `${String(i).padStart(2, '0')}:00`;
            const isBooked = bizInfo.bookedSlots?.some(b => b.date === formData.date && b.time === timeStr);
            if (!isBooked) slots.push(timeStr);
        }
        return slots;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        const res = await fetch(`${CONFIG.API_BASE_URL}/bookings/public`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, slug: businessSlug.toLowerCase().trim(), service_id: selectedService.id })
        });
        if (res.ok) setIsConfirmed(true);
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#0A2540] animate-pulse">APOINTA LOADING...</div>;

    if (isConfirmed) return (
        <div className="max-w-md mx-auto mt-20 text-center p-12 bg-white rounded-3xl shadow-2xl border-t-8 border-[#00E5FF]">
            <CheckCircle size={64} className="text-[#2F80FF] mx-auto mb-4" />
            <h2 className="text-3xl font-black text-[#0A2540]">Appointment Secured</h2>
            
            {/* DISPLAY THE STRING DIRECTLY */}
            <p className="mt-4 text-slate-500 font-medium">
                Your session for {formData.date} at {formData.time} is verified.
            </p>
            
            <button onClick={() => window.location.reload()} className="mt-10 bg-[#0A2540] text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-[#2F80FF] transition-all uppercase text-xs tracking-wide">
                Book Another
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F9FC] pb-20 font-sans">
            <header className="bg-[#0A2540] text-white py-14 px-6 text-center relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2F80FF] rounded-full text-[10px] font-black uppercase mb-4 tracking-widest shadow-lg shadow-[#2F80FF]/20">
                    <ShieldCheck size={12}/> Apointa Verified
                </div>
                <h1 className="text-4xl font-black tracking-tight capitalize leading-tight">{bizInfo.user.business_name}</h1>
            </header>

            <div className="max-w-xl mx-auto -mt-8 px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-slate-100">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-[#0A2540] text-xs uppercase text-center mb-6 tracking-widest opacity-40">Select Experience</h3>
                            {bizInfo.services.map(s => (
                                <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full flex justify-between p-6 border-2 border-slate-50 rounded-2xl hover:border-[#2F80FF] hover:bg-[#2F80FF]/5 transition-all text-left bg-white shadow-sm">
                                    <div><p className="font-bold text-[#0A2540] text-lg leading-tight uppercase">{s.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wide">{s.duration} min session</p></div>
                                    <span className="text-xl font-bold text-[#0A2540]">R{s.price}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleBooking} className="space-y-8">
                            <button type="button" onClick={() => setStep(1)} className="text-[#2F80FF] text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4">← Back to Menu</button>
                            
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1. Your Details</h4>
                                <input required placeholder="Your Full Name" className="w-full bg-[#F7F9FC] p-4 rounded-xl outline-none font-bold text-[#0A2540] border-2 border-transparent focus:border-[#2F80FF]" onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                                <input required placeholder="Phone Number" className="w-full bg-[#F7F9FC] p-4 rounded-xl outline-none font-bold text-[#0A2540] border-2 border-transparent focus:border-[#2F80FF]" onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2. Choose Date</h4>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={16}/></button>
                                        <span className="text-xs font-bold uppercase text-[#0A2540] tracking-tighter w-24 text-center">{viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={16}/></button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                    {['S','M','T','W','T','F','S'].map((day, i) => (
                                        <div key={i} className="text-[9px] font-black text-slate-300 uppercase">{day}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-1.5">
                                    {generateCalendar().map((item, idx) => (
                                        item.type === 'empty' ? <div key={idx}></div> : (
                                            <button key={item.fullDate} type="button" disabled={item.disabled} onClick={() => setFormData({...formData, date: item.fullDate, time: ''})} className={`h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${item.disabled ? 'text-slate-100 opacity-20' : formData.date === item.fullDate ? 'bg-[#2F80FF] text-white shadow-md scale-105' : 'bg-slate-50 text-[#0A2540] hover:border-[#2F80FF] border-2 border-transparent'}`}>{item.day}</button>
                                        )
                                    ))}
                                </div>
                            </div>

                            {formData.date && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">3. Available Times</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {getAvailableSlots().map(t => (
                                            <button key={t} type="button" onClick={() => setFormData({...formData, time: t})} className={`py-3.5 rounded-xl text-xs font-bold border-2 transition-all ${formData.time === t ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-lg' : 'bg-[#F7F9FC] border-transparent text-[#0A2540] hover:border-[#2F80FF]'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="w-full bg-[#0A2540] text-white py-5 rounded-2xl font-bold text-base shadow-xl disabled:opacity-20 active:scale-95 transition-all uppercase tracking-widest" disabled={!formData.date || !formData.time}>Secure Slot</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerBooking;