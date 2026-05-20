import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Trash2, LogOut, CheckCircle, Menu, X, Copy, ExternalLink, Clock, Phone, Briefcase, Settings, ShieldCheck, Plus, Check, User, MessageSquare } from 'lucide-react';
import { api } from '../api';
import { CONFIG } from '../config';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('agenda'); 
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
    const [availability, setAvailability] = useState({});
    const [showQR, setShowQR] = useState(false);

    const businessSlug = localStorage.getItem('slug') || 'merchant'; 
    const businessName = localStorage.getItem('business_name') || 'Merchant';
    const bookingLink = `${window.location.origin}/book/${businessSlug}`;

    const fetchData = useCallback(async () => {
        try {
            const bData = await api.get('/bookings');
            const sData = await api.get('/services');
            const profile = await api.get('/profile'); 
            setBookings(Array.isArray(bData) ? bData : []);
            setServices(Array.isArray(sData) ? sData : []);
            if (profile?.availability) setAvailability(profile.availability);
        } catch (e) { console.error("Sync Error:", e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); 
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleSaveAvailability = async () => {
        try {
            await api.patch('/settings', { availability });
            alert("Apointa: Schedule Updated!");
        } catch (err) { alert("Save failed"); }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(bookingLink);
            alert("Link copied to clipboard!");
        } catch (err) {
            const textArea = document.createElement("textarea");
            textArea.value = bookingLink;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert("Link copied!");
        }
    };

    const handleReschedule = async (id) => {
        const newTime = window.prompt("New time (HH:00):");
        if (newTime) {
            try {
                await api.patch(`/bookings/${id}/reschedule`, { time: newTime });
                fetchData();
            } catch (err) { alert("Reschedule failed"); }
        }
    };

    const handleComplete = async (id) => { await api.patch(`/bookings/${id}`); fetchData(); };
    const handleDelete = async (path, id) => { if(window.confirm("Delete permanently?")) { await api.delete(`${path}/${id}`); fetchData(); } };
    
    const handleAddService = async (e) => {
        e.preventDefault();
        await api.post('/services', newService);
        setNewService({ name: '', price: '', duration: '' });
        fetchData();
    };

    const grouped = bookings.reduce((acc, b) => {
        const date = b.date || 'Unscheduled';
        if (!acc[date]) acc[date] = [];
        acc[date].push(b);
        return acc;
    }, {});

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-slate-400 animate-pulse">Syncing Apointa Core...</div>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F9FC] text-[#0A2540]">
            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-[#0A2540] text-white p-6 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col shadow-2xl`}>
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 bg-[#2F80FF] rounded flex items-center justify-center font-bold text-white italic">A</div>
                    <h1 className="text-xl font-bold tracking-tight uppercase italic">Apointa</h1>
                </div>
                <nav className="flex-1 space-y-1">
                    <button onClick={() => {setActiveTab('agenda'); setIsSidebarOpen(false);}} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'agenda' ? 'bg-white/10 text-[#00E5FF]' : 'text-slate-400 hover:text-white'}`}>
                        <Calendar size={18} /> <span>Agenda</span>
                    </button>
                    <button onClick={() => {setActiveTab('services'); setIsSidebarOpen(false);}} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'services' ? 'bg-white/10 text-[#00E5FF]' : 'text-slate-400 hover:text-white'}`}>
                        <Briefcase size={18} /> <span>Services</span>
                    </button>
                    <button onClick={() => {setActiveTab('settings'); setIsSidebarOpen(false);}} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'settings' ? 'bg-white/10 text-[#00E5FF]' : 'text-slate-400 hover:text-white'}`}>
                        <Settings size={18} /> <span>Availability</span>
                    </button>
                </nav>
                <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="flex items-center space-x-3 text-red-400 text-sm font-bold p-3 hover:bg-white/5 rounded-lg transition mt-auto pt-6 border-t border-white/10"><LogOut size={18} /> Logout</button>
            </aside>

            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-[55] md:hidden" />}

            <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
                {/* Mobile Menu Button */}
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mb-6 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"><Menu size={20}/></button>
                
                {/* PRO HEADER WITH QR & LIVE SITE */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold capitalize text-[#0A2540]">{businessName}</h2>
                            <ShieldCheck className="text-[#2F80FF]" size={24} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-1 tracking-wide">Operational Portal</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                        <a href={bookingLink} target="_blank" rel="noreferrer" className="flex-1 md:flex-none text-center bg-[#0A2540] text-white p-4 px-6 rounded-2xl text-xs font-black shadow-lg hover:bg-slate-800 active:scale-95 transition-all uppercase">
                            View Live Site
                        </a>
                        <button onClick={copyLink} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-[#0A2540] p-4 rounded-2xl text-xs font-black active:bg-slate-50 transition-all">
                            <Copy size={16}/> Copy Link
                        </button>
                        <button onClick={() => setShowQR(!showQR)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#2F80FF] text-white p-4 rounded-2xl text-xs font-black shadow-md active:scale-95 transition-all">
                            <ShieldCheck size={16}/> {showQR ? 'Hide QR' : 'Get QR Code'}
                        </button>
                    </div>
                </header>

                {/* QR CODE POPUP */}
                {showQR && (
                    <div className="mb-10 p-8 bg-white rounded-[2.5rem] border-2 border-[#2F80FF] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                        <h3 className="font-black text-[#0A2540] uppercase text-sm mb-4">Your Business QR Code</h3>
                        <div className="bg-white p-4 rounded-3xl border border-slate-50">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingLink)}&color=0A2540`} alt="Business QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-slate-400 text-[10px] mt-6 font-medium max-w-xs">Scan with phone camera to book. Print this for your shop window!</p>
                    </div>
                )}

                <div className="mt-4">
                    {activeTab === 'agenda' && (
                        <div className="space-y-6">
                            {Object.entries(grouped).map(([date, dayBookings]) => (
                                <div key={date} className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wide">{new Date(date).toDateString()}</h4>
                                    {dayBookings.map(b => (
                                        <div key={b.id} className={`bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition ${b.status === 'completed' ? 'opacity-40 grayscale' : 'hover:border-[#2F80FF] shadow-md'}`}>
                                            <div className="flex items-center gap-6">
                                                <div className="text-2xl font-black text-[#0A2540] w-14">{b.time}</div>
                                                <div className="h-12 w-1 bg-slate-100 rounded-full hidden sm:block"></div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User size={16} className="text-[#0A2540]" />
                                                        <p className="font-black text-[#0A2540] text-xl uppercase tracking-tighter leading-none">{b.customer_name || 'Guest'}</p>
                                                    </div>
                                                    <div className="flex flex-col gap-1 text-[#2F80FF] font-black text-[10px] uppercase tracking-wide">
                                                        <span>{b.customer_phone}</span>
                                                        {b.notes && <span className="text-slate-400 normal-case font-medium italic">"{b.notes}"</span>}
                                                    </div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase mt-3 tracking-wide">{b.service_name}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {b.status !== 'completed' && <button onClick={() => handleComplete(b.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle size={22}/></button>}
                                                <button onClick={() => handleReschedule(b.id)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><Clock size={22}/></button>
                                                <button onClick={() => handleDelete('/bookings', b.id)} className="p-2 text-red-300 hover:bg-red-50 rounded-lg"><Trash2 size={22}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase ml-1 mb-4 tracking-wide">Active Menu</h3>
                                {services.map(s => (
                                    <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                                        <div><p className="font-bold text-sm uppercase">{s.name}</p><p className="text-xs text-slate-400 font-bold">{CONFIG.CURRENCY}{s.price} • {s.duration} mins</p></div>
                                        <button onClick={() => handleDelete('/services', s.id)} className="text-slate-200 hover:text-red-500 p-2 transition"><Trash2 size={20}/></button>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#0A2540] text-white p-8 rounded-xl shadow-xl h-fit border-t-4 border-[#2F80FF]">
                                <h3 className="font-bold text-sm mb-6 uppercase tracking-wide text-center">New Service</h3>
                                <form onSubmit={handleAddService} className="space-y-4">
                                    <input placeholder="Title" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm text-white" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input placeholder="Price" type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm text-white" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                                        <input placeholder="Mins" type="number" className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm text-white" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} />
                                    </div>
                                    <button className="w-full bg-[#2F80FF] py-3 rounded-lg font-bold text-sm uppercase">Create Service</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-xl bg-white p-8 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-sm mb-2 uppercase tracking-wide">Availability</h3>
                            <div className="space-y-3 mt-6">
                                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((dayName, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-slate-50 bg-slate-50/50">
                                        <div className="flex items-center gap-3 w-28">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2F80FF]" checked={availability[index]?.open || false} onChange={(e) => {
                                                const n = { ...availability };
                                                if (!n[index]) n[index] = { start: "09:00", end: "17:00" };
                                                n[index].open = e.target.checked;
                                                setAvailability(n);
                                            }} />
                                            <span className="text-sm font-semibold">{dayName}</span>
                                        </div>
                                        {availability[index]?.open ? (
                                            <div className="flex items-center gap-2">
                                                <input type="time" className="p-1 border border-slate-200 rounded text-xs" value={availability[index].start} onChange={(e) => { const n = {...availability}; n[index].start = e.target.value; setAvailability(n); }} />
                                                <span className="text-slate-300">—</span>
                                                <input type="time" className="p-1 border border-slate-200 rounded text-xs" value={availability[index].end} onChange={(e) => { const n = {...availability}; n[index].end = e.target.value; setAvailability(n); }} />
                                            </div>
                                        ) : <span className="text-xs font-bold text-slate-300 uppercase mr-8 tracking-wide">Closed</span>}
                                    </div>
                                ))}
                            </div>
                            <button onClick={handleSaveAvailability} className="w-full mt-8 bg-[#0A2540] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#2F80FF] transition flex items-center justify-center gap-2 shadow-xl"><Check size={18}/> Save Schedule</button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;