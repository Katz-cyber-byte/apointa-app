import React from 'react';

const Privacy = () => (
    <div className="min-h-screen bg-white p-8 md:p-20 font-sans text-slate-800 leading-relaxed max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-[#0A2540] mb-8 uppercase tracking-tighter italic">Privacy Policy (POPIA)</h1>
        <p className="mb-4">Apointa is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA).</p>

        <section className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">What We Collect</h2>
                <ul className="list-disc ml-6">
                    <li>Full Names</li>
                    <li>Contact Numbers</li>
                    <li>Email Addresses</li>
                </ul>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">How We Use Data</h2>
                <p>Data is used exclusively to facilitate and confirm appointments between the Merchant and the Customer.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">Security</h2>
                <p>We use industry-standard encryption (JWT and SSL) to protect data moving between the browser and our servers. Data is stored on secure cloud infrastructure.</p>
            </div>
            <div>
                <h2 className="text-xl font-bold text-[#0A2540]">Your Rights</h2>
                <p>Users may request the deletion of their personal data at any time by contacting the business owner or Apointa support.</p>
            </div>
        </section>
    </div>
);

export default Privacy;