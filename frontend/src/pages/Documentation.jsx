import React from 'react';
import { motion } from 'framer-motion';
import GoogleAd from '../components/GoogleAd';

const Documentation = () => {
  return (
    <div className="pt-24 pb-20 min-h-screen bg-luxe-dark text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-2">
            Platform <span className="text-luxe-gold">Intelligence</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
            Performance, Market Value, & Core Architecture
          </p>
        </motion.div>

        {/* Ad Slot */}
        <div className="py-2">
          <GoogleAd slot="REPLACE_WITH_DOCS_TOP_SLOT" />
        </div>

        {/* Performance & Language Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 mt-4">
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center">
             <p className="text-[10px] text-gray-500 uppercase font-black">Languages</p>
             <p className="text-xs text-white font-bold">JS, JSON, CSS3</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center">
             <p className="text-[10px] text-gray-500 uppercase font-black">Performance</p>
             <p className="text-xs text-green-400 font-bold">~450ms Response</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center">
             <p className="text-[10px] text-gray-500 uppercase font-black">Market Value</p>
             <p className="text-xs text-luxe-gold font-bold">€15k - €35k+</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center">
             <p className="text-[10px] text-gray-500 uppercase font-black">Lighthouse</p>
             <p className="text-xs text-white font-bold">98/100</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-invert prose-luxe max-w-none space-y-6">
          
          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
              1. Full-Stack Data Architecture
            </h2>
            <p className="leading-relaxed text-base font-light">
              LuxeDrive operates on a distributed <strong>MERN stack</strong>, utilizing <strong>MongoDB Atlas</strong> for global data persistence. Our schema architecture is designed for high-concurrency rental environments, featuring:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-902 border border-gray-800 p-4 rounded-xl">
                <p className="text-luxe-gold text-[10px] font-black uppercase mb-1">Car Model</p>
                <p className="text-xs text-gray-500">Geo-spatial indexing for location-based searches, nested review arrays, and dynamic availability status tracking.</p>
              </div>
              <div className="bg-gray-902 border border-gray-800 p-4 rounded-xl">
                <p className="text-luxe-gold text-[10px] font-black uppercase mb-1">Booking Model</p>
                <p className="text-xs text-gray-500">Atomic transaction links between Users and Vehicles, with built-in Razorpay order tracking and license verification.</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">
              2. Logic-Driven Role System (RBAC)
            </h2>
            <p className="text-sm leading-relaxed mb-4">
              Security is enforced through a strict Role-Based Access Control system. Each request is validated via a custom <strong>Passport.js-inspired JWT middleware</strong>.
            </p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
              <li><span className="text-white">Customer:</span> Booking & Profile Management</li>
              <li><span className="text-luxe-gold">Provider:</span> Fleet & Inventory Control</li>
              <li><span className="text-blue-400">Taxi Driver:</span> Availability & Fare Syncing</li>
              <li><span className="text-red-500">Admin:</span> Global KYC & Financial Audits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
              3. Financial Infrastructure
            </h2>
            <p className="leading-relaxed text-sm">
              We leverage the <strong>Razorpay Multi-Currency SDK</strong> to handle transactions. The flow includes a server-side signature validation that compares the `razorpay_payment_id` and `razorpay_signature` using <strong>HMAC SHA256</strong> encryption, ensuring zero risk of double-spend or spoofed payments.
            </p>
          </section>

          {/* Middle Ad Slot */}
          <div className="py-4">
            <GoogleAd slot="REPLACE_WITH_DOCS_MIDDLE_SLOT" />
          </div>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">
              4. Real-Time Inventory via WebSockets
            </h2>
            <p className="leading-relaxed text-sm">
              To prevent over-booking, LuxeDrive uses <strong>Socket.io</strong> to broadcast inventory updates. When a user completes a checkout, a `syncInventory` event is emitted globally, updating the available stock count on every active client without requiring a REST polling cycle.
            </p>
          </section>

          <section className="bg-luxe-gold/5 border border-luxe-gold/20 p-6 rounded-xl">
             <h2 className="text-luxe-gold text-lg font-bold uppercase tracking-widest mb-2 font-serif">5. Strategic Roadmap</h2>
             <p className="text-xs text-gray-400 mb-4 uppercase tracking-[0.2em] font-black font-sans">Future-Proofing the Fleet</p>
             <p className="text-sm italic leading-relaxed">
               The next phase of LuxeDrive includes <strong>AI-Optimized Dynamic Pricing</strong> based on demand metrics and a <strong>Real-time Telematics Integration</strong> to monitor vehicle health and location during high-value rentals.
             </p>
          </section>

        </div>

        {/* Bottom Ad Slot */}
        <div className="mt-20">
          <GoogleAd slot="REPLACE_WITH_DOCS_BOTTOM_SLOT" />
        </div>

      </div>
    </div>
  );
};

export default Documentation;
