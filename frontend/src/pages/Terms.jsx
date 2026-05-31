import React from 'react';

const Terms = () => (
    <div className="min-h-screen bg-white p-8 md:p-20 font-sans text-slate-800 leading-relaxed max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#0A2540] mb-8 uppercase tracking-tighter italic">Apointa Terms of Service</h1>
        <p className="mb-4 font-bold">Last Updated: May 2025</p>
        
        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">1. Acceptance of Terms</h2>
                <p>By creating an account on Apointa, you ("The Merchant") agree to these terms. Apointa provides a booking management platform.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">2. Service Fees</h2>
                <p>Apointa is a subscription-based service (R149/month). Fees are non-refundable. Failure to pay will result in the suspension of your booking link.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">3. Limitation of Liability</h2>
                <p>Apointa is provided "as is". We are not liable for any lost profits, missed appointments, or data loss. The Merchant uses this service at their own risk.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">4. Data Ownership</h2>
                <p>The Merchant owns the data of their customers. Apointa will not sell or use this data for marketing purposes.</p>
            </div>
        </section>
        <div className="mt-20 text-slate-400 text-xs">Apointa is a South African registered entity.</div>
    </div>
);

export default Terms;