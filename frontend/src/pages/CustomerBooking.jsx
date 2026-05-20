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
        fetch(`${CONFIG.API_BASE_URL}/public/business-info/${businessSlug.toLowerCase().trim()}`)
            .then(res => res.json())
            .then(data => { setBizInfo(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [businessSlug]);

    const generateCalendar = () => {
        if (!bizInfo?.user?.availability) return [];
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push({ type: 'empty' });
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isPast = dateObj < today;
            const isClosed = !bizInfo.user.availability[dateObj.getDay()]?.open;
            days.push({ day: d, fullDate, disabled: isPast || isClosed, type: 'day' });
        }
        return days;
    };

    const getAvailableSlots = () => {
        // 1. Safety Check: If no business info or no date selected
        if (!bizInfo?.user?.availability || !formData.date) return [];
    
        const [y, m, d] = formData.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const dayOfWeek = dateObj.getDay();
    
        // 2. Safety Check: Get settings for this specific day
        const daySettings = bizInfo.user.availability[dayOfWeek];

        // 3. THE FIX: If the shop hasn't set hours for this day yet, don't crash!
        if (!daySettings || !daySettings.open || !daySettings.start || !daySettings.end) {
        return []; 
    }

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
        else {
            const data = await res.json();
            alert(data.error || "Slot taken!");
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#0A2540] animate-pulse uppercase tracking-widest">Apointa Network Sync...</div>;

    if (isConfirmed) return (
        <div className="max-w-md mx-auto mt-20 text-center p-12 bg-white rounded-2xl shadow-2xl border-t-8 border-[#2F80FF]">
            <CheckCircle size={64} className="text-[#2F80FF] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0A2540]">Securely Booked.</h2>
            <p className="mt-2 text-slate-500">{formData.date} at {formData.time}</p>
            <button onClick={() => window.location.reload()} className="mt-10 bg-[#0A2540] text-white px-10 py-4 rounded-xl font-bold shadow-lg">Done</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F9FC] pb-20 font-sans">
            <header className="bg-[#0A2540] text-white py-12 px-6 text-center relative overflow-hidden">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2F80FF] rounded-full text-[10px] font-bold uppercase mb-4 tracking-widest shadow-lg"><ShieldCheck size={12}/> Apointa Verified Merchant</div>
                <h1 className="text-4xl font-bold tracking-tight capitalize leading-tight">{bizInfo.user.business_name}</h1>
            </header>

            <div className="max-w-xl mx-auto -mt-6 px-4">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-10 border border-slate-100">
                    {step === 1 ? (
                        <div className="space-y-3">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase text-center mb-6 tracking-widest">Select Experience</h3>
                            {bizInfo.services.map(s => (
                                <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full flex justify-between p-6 border-2 border-slate-50 rounded-xl hover:border-[#2F80FF] hover:bg-[#2F80FF]/5 transition-all text-left bg-white shadow-sm">
                                    <div><p className="font-bold text-[#0A2540] text-lg leading-tight uppercase">{s.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{s.duration} min session</p></div>
                                    <span className="text-xl font-bold text-[#0A2540]">R{s.price}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleBooking} className="space-y-6">
                            <button type="button" onClick={() => setStep(1)} className="text-[#2F80FF] text-[10px] font-bold uppercase underline">← Back to Services</button>
                            <div className="space-y-3">
                                <input required placeholder="Your Full Name" className="w-full p-4 border border-slate-200 rounded-lg text-sm font-bold" onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                                <input required placeholder="Phone Number" className="w-full p-4 border border-slate-200 rounded-lg text-sm font-bold" onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Date</h4>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={16}/></button>
                                        <span className="text-xs font-bold uppercase text-[#0A2540]">{viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={16}/></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                                    {['S','M','T','W','T','F','S'].map((day, i) => <div key={i} className="text-[9px] font-black text-slate-300 uppercase">{day}</div>)}
                                </div>
                                <div className="grid grid-cols-7 gap-1.5">
                                    {generateCalendar().map((item, idx) => (
                                        item.type === 'empty' ? <div key={idx}></div> : (
                                            <button key={item.fullDate} type="button" disabled={item.disabled} onClick={() => setFormData({...formData, date: item.fullDate, time: ''})} className={`h-11 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${item.disabled ? 'text-slate-100 opacity-20' : formData.date === item.fullDate ? 'bg-[#2F80FF] text-white shadow-md scale-105' : 'bg-slate-50 text-[#0A2540] hover:bg-slate-100'}`}>{item.day}</button>
                                        )
                                    ))}
                                </div>
                            </div>

                            {formData.date && (
                                <div className="space-y-3 animate-in fade-in">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Times</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {getAvailableSlots().map(t => (
                                            <button key={t} type="button" onClick={() => setFormData({...formData, time: t})} className={`py-3.5 rounded-xl text-xs font-bold border-2 transition-all ${formData.time === t ? 'bg-[#0A2540] border-[#0A2540] text-white shadow-lg' : 'bg-[#F7F9FC] border-transparent text-[#0A2540] hover:border-[#2F80FF]'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="w-full bg-[#0A2540] text-white py-5 rounded-xl font-bold text-sm shadow-xl disabled:opacity-20 active:scale-95 transition-all uppercase tracking-widest" disabled={!formData.date || !formData.time}>Secure Slot</button>
                        </form>
                    )}
                </div>
                <p className="text-center mt-12 text-slate-300 font-bold text-[10px] uppercase tracking-[0.4em] italic px-6">Infrastructure by Apointa Cloud</p>
            </div>
        </div>
    );
};

export default CustomerBooking;