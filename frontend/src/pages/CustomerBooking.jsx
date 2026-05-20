import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Clock, ShieldCheck, ChevronLeft, ChevronRight, User, Phone } from 'lucide-react';
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
        fetch(`${CONFIG.API_BASE_URL}/public/business-info/${businessSlug.toLowerCase()}`)
            .then(res => res.json())
            .then(data => { setBizInfo(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [businessSlug]);

    const generateCalendar = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push({ type: 'empty' });
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const isPast = dateObj < today;
            const isClosed = !bizInfo?.user?.availability[dateObj.getDay()]?.open;
            days.push({ day: d, fullDate: dateObj.toISOString().split('T')[0], disabled: isPast || isClosed, type: 'day' });
        }
        return days;
    };

    const getAvailableSlots = () => {
        if (!bizInfo?.user || !formData.date) return [];
        const daySettings = bizInfo.user.availability[new Date(formData.date).getDay()];
        if (!daySettings?.open) return [];
        const start = parseInt(daySettings.start.split(':')[0]);
        const end = parseInt(daySettings.end.split(':')[0]);
        let slots = [];
        for (let i = start; i < end; i++) {
            const timeStr = `${i.toString().padStart(2, '0')}:00`;
            if (!bizInfo.bookedSlots.some(b => b.date === formData.date && b.time === timeStr)) slots.push(timeStr);
        }
        return slots;
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        const res = await fetch(`${CONFIG.API_BASE_URL}/bookings/public`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, slug: businessSlug.toLowerCase(), service_id: selectedService.id })
        });
        if (res.ok) setIsConfirmed(true);
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-bold animate-pulse text-[#0A2540]">Syncing...</div>;
    if (isConfirmed) return (
        <div className="max-w-md mx-auto mt-20 text-center p-12 bg-white rounded-2xl shadow-xl border-t-4 border-[#2F80FF]">
            <CheckCircle size={50} className="text-[#2F80FF] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#0A2540]">Appointment Secured</h2>
            <p className="text-sm text-slate-500 mt-2">{formData.date} — {formData.time}</p>
            <button onClick={() => window.location.reload()} className="mt-8 text-[#2F80FF] font-bold text-sm underline">Book Another</button>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F7F9FC] pb-10 font-sans">
            <header className="bg-[#0A2540] text-white py-12 px-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase mb-4 text-[#2F80FF] tracking-wide"><ShieldCheck size={12}/> Apointa Verified</div>
                <h1 className="text-3xl font-bold capitalize">{bizInfo.user.business_name}</h1>
            </header>

            <div className="max-w-xl mx-auto -mt-6 px-4">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-slate-100">
                    {step === 1 ? (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase text-center mb-6 tracking-wide">Available Services</h3>
                            {bizInfo.services.map(s => (
                                <button key={s.id} onClick={() => { setSelectedService(s); setStep(2); }} className="w-full flex justify-between p-5 border border-slate-100 rounded-lg hover:border-[#2F80FF] transition text-left group">
                                    <div><p className="font-bold text-[#0A2540] text-lg group-hover:text-[#2F80FF]">{s.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{s.duration} min</p></div>
                                    <span className="text-xl font-bold text-[#0A2540]">R{s.price}</span>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleBooking} className="space-y-6">
                            <button type="button" onClick={() => setStep(1)} className="text-[#2F80FF] text-[10px] font-bold uppercase tracking-wide underline">← Back to services</button>
                            <div className="space-y-3">
                                <input required placeholder="Name" className="w-full p-4 border border-slate-200 rounded-lg text-sm font-bold" onChange={e => setFormData({...formData, customer_name: e.target.value})} />
                                <input required placeholder="Phone" className="w-full p-4 border border-slate-200 rounded-lg text-sm font-bold" onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Date</h4>
                                    <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={16}/></button>
                                        <span className="text-xs font-bold uppercase">{viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                        <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={16}/></button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {generateCalendar().map((item, idx) => (
                                        item.type === 'empty' ? <div key={idx}></div> : (
                                            <button key={item.fullDate} type="button" disabled={item.disabled} onClick={() => setFormData({...formData, date: item.fullDate, time: ''})} className={`h-10 rounded flex items-center justify-center text-xs font-bold transition-all ${item.disabled ? 'text-slate-100' : formData.date === item.fullDate ? 'bg-[#2F80FF] text-white shadow-md' : 'bg-slate-50 text-[#0A2540] hover:bg-slate-100'}`}>{item.day}</button>
                                        )
                                    ))}
                                </div>
                            </div>

                            {formData.date && (
                                <div className="space-y-3 animate-in fade-in">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time Slot</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {getAvailableSlots().map(t => (
                                            <button key={t} type="button" onClick={() => setFormData({...formData, time: t})} className={`py-3 rounded-lg text-xs font-bold border transition-all ${formData.time === t ? 'bg-[#0A2540] text-white' : 'bg-slate-50 text-[#0A2540] hover:border-[#2F80FF]'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button className="w-full bg-[#0A2540] text-white py-4 rounded-lg font-bold text-sm shadow-lg disabled:opacity-20 transition-all uppercase tracking-wide" disabled={!formData.date || !formData.time}>Secure Appointment</button>
                        </form>
                    )}
                </div>
                <p className="text-center mt-8 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Apointa System v1.0</p>
            </div>
        </div>
    );
};

export default CustomerBooking;