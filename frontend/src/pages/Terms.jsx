import React from 'react';

const Terms = () => (
    <div className="min-h-screen bg-white p-8 md:p-20 font-sans text-slate-800 leading-relaxed max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#0A2540] mb-8 uppercase tracking-tight italic">Schedinary Terms of Service</h1>
        <p className="mb-4 font-bold text-xs">Last Updated: May 2025</p>
        
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">1. Acceptance of Terms</h2>
                <p className="text-sm">By creating an account on Schedinary, you ("The Merchant") agree to these terms. Schedinary provides a booking management platform.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">2. Service Fees</h2>
                <p className="text-sm">Schedinary is a subscription-based service (R149/month). Fees are non-refundable. Failure to pay will result in the suspension of your booking link.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">3. Limitation of Liability</h2>
                <p className="text-sm">Schedinary is provided "as is". We are not liable for any lost profits or missed appointments. The Merchant uses this service at their own risk.</p>
            </div>
        </section>
        <div className="mt-20 text-slate-400 text-xs font-bold uppercase tracking-wide">Schedinary South Africa</div>
    </div>
);

export default Terms;