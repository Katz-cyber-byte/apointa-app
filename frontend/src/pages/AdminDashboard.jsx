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

    const businessSlug = localStorage.getItem('slug') || 'default'; 
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
            alert("Schedule Updated");
        } catch (err) { alert("Save failed"); }
    };

    // --- LOGIC FUNCTIONS ---
    const handleReschedule = async (id) => {
        const newTime = window.prompt("Enter new time (e.g. 14:00):");
        if (newTime) {
            try {
                const res = await fetch(`${CONFIG.API_BASE_URL}/bookings/${id}/reschedule`, {
                    method: 'PATCH',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': localStorage.getItem(CONFIG.ADMIN_TOKEN_KEY) 
                    },
                    body: JSON.stringify({ time: newTime })
                });
                if (res.ok) {
                    alert("Appointment moved!");
                    fetchData();
                } else {
                    alert("Failed to reschedule.");
                }
            } catch (e) { alert("Error connecting to server."); }
        }
    };

    const handleComplete = async (id) => { await api.patch(`/bookings/${id}`); fetchData(); };
    const handleDelete = async (path, id) => { if(window.confirm("Delete this?")) { await api.delete(`${path}/${id}`); fetchData(); } };
    
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

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#F7F9FC]">
            <div className="w-10 h-10 border-4 border-[#2F80FF] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#0A2540] font-bold text-xs uppercase tracking-wide animate-pulse">Syncing Apointa...</p>
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F9FC] text-[#0A2540]">
            {/* SIDEBAR */}
            <aside className={`fixed inset-y-0 left-0 z-[60] w-64 bg-[#0A2540] text-white p-6 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col shadow-2xl`}>
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 bg-[#2F80FF] rounded flex items-center justify-center font-bold text-white italic shadow-lg">A</div>
                    <h1 className="text-xl font-bold tracking-tight uppercase italic">Apointa</h1>
                </div>
                <nav className="flex-1 space-y-1">
                    <button onClick={() => {setActiveTab('agenda'); setIsSidebarOpen(false);}} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'agenda' ? 'bg-[#2F80FF] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                        <Calendar size={18} /> <span>Agenda</span>
                    </button>
                    <button onClick={() => {setActiveTab('services'); setIsSidebarOpen(false);}} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'services' ? 'bg-[#2F80FF] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                        <Briefcase size={18} /> <span>Services</span>
                    </button>
                    <button onClick={() => {setActiveTab('settings'); setIsSidebarOpen(false);}} className={`w-full flex items-center space-x-3 p-3 rounded-xl text-sm font-bold transition ${activeTab === 'settings' ? 'bg-[#2F80FF] text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'}`}>
                        <Settings size={18} /> <span>Availability</span>
                    </button>
                </nav>
                <button onClick={() => { localStorage.clear(); window.location.href='/login'; }} className="flex items-center space-x-3 text-red-400 text-sm font-bold p-3 hover:bg-white/5 rounded-lg transition mt-auto pt-6 border-t border-white/10"><LogOut size={18} /> Logout</button>
            </aside>

            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-[55] md:hidden" />}

            {/* MAIN */}
            <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
                <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mb-6 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"><Menu size={20}/></button>
                
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold capitalize">{businessName}</h2>
                        <ShieldCheck className="text-[#2F80FF]" size={20} />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => {navigator.clipboard.writeText(bookingLink); alert("Link Copied");}} className="bg-white border p-3 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">Copy Link</button>
                        <a href={bookingLink} target="_blank" rel="noreferrer" className="bg-[#0A2540] text-white p-3 px-6 rounded-xl text-xs font-black shadow-lg hover:bg-[#2F80FF] transition-all">View Live Site</a>
                    </div>
                </header>

                <div className="mt-4">
                    {activeTab === 'agenda' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {Object.keys(grouped).length === 0 ? (
                                <div className="bg-white p-20 rounded-[2rem] border border-dashed border-slate-200 text-center text-slate-300 font-bold">No activity detected.</div>
                            ) : (
                                Object.entries(grouped).map(([date, dayBookings]) => (
                                    <div key={date} className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase ml-1 tracking-wide">{new Date(date).toDateString()}</h4>
                                        {dayBookings.map(b => (
                                            <div key={b.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition ${b.status === 'completed' ? 'opacity-40 grayscale' : 'hover:border-[#2F80FF] shadow-md'}`}>
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
                                                    {b.status !== 'completed' && <button onClick={() => handleComplete(b.id)} className="bg-green-50 text-green-500 p-3 rounded-2xl hover:bg-green-500 hover:text-white transition shadow-sm"><CheckCircle size={22}/></button>}
                                                    <button onClick={() => handleReschedule(b.id)} className="bg-slate-50 text-slate-400 p-3 rounded-2xl hover:bg-[#2F80FF] hover:text-white transition shadow-sm"><Clock size={22}/></button>
                                                    <button onClick={() => handleDelete('/bookings', b.id)} className="bg-red-50 text-red-300 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition shadow-sm"><Trash2 size={22}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="lg:col-span-2 space-y-3">
                                <h3 className="text-xs font-bold text-slate-400 uppercase ml-1 mb-4 tracking-wide">Active Menu</h3>
                                {services.map(s => (
                                    <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                                        <div><p className="font-bold text-sm uppercase">{s.name}</p><p className="text-xs text-slate-400 font-bold">{CONFIG.CURRENCY}{s.price} • {s.duration} mins</p></div>
                                        <button onClick={() => handleDelete('/services', s.id)} className="text-slate-200 hover:text-red-500 p-2 transition"><Trash2 size={20}/></button>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-[#0A2540] text-white p-8 rounded-[2.5rem] shadow-xl border-t-8 border-[#2F80FF] h-fit sticky top-10">
                                <h3 className="font-bold text-sm mb-6 uppercase tracking-wide text-center">New Integration</h3>
                                <form onSubmit={handleAddService} className="space-y-4">
                                    <input placeholder="Title" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-[#2F80FF]" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input placeholder="Price" type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                                        <input placeholder="Mins" type="number" className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} />
                                    </div>
                                    <button className="w-full bg-[#2F80FF] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-wide shadow-xl shadow-[#2F80FF]/20 hover:bg-[#00E5FF] hover:text-[#0A2540] transition-all mt-2">Deploy Service</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-xl bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4">
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