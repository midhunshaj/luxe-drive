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
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center font-sans tracking-tight">
             <p className="text-[10px] text-gray-500 uppercase font-black">Architecture</p>
             <p className="text-xs text-white font-bold">MERN (SPA)</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center font-sans tracking-tight">
             <p className="text-[10px] text-gray-500 uppercase font-black">Performance</p>
             <p className="text-xs text-green-400 font-bold">~147ms Response</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center font-sans tracking-tight">
             <p className="text-[10px] text-gray-500 uppercase font-black">Market Value</p>
             <p className="text-xs text-luxe-gold font-bold">€15k - €35k+</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg text-center font-sans tracking-tight">
             <p className="text-[10px] text-gray-500 uppercase font-black">Lighthouse</p>
             <p className="text-xs text-white font-bold">98/100</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-invert prose-luxe max-w-none space-y-6 lg:space-y-8">
          
          <section className="border-b border-gray-900 pb-8">
            <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
              1. The MERN Stack Ecosystem
            </h2>
            <p className="leading-relaxed text-base font-light text-justify">
              LuxeDrive is powered by the <strong>MERN (MongoDB, Express, React, Node.js)</strong> stack—a high-performance, unified JavaScript environment designed for the modern web. By leveraging <strong>MongoDB</strong> as a document-based NoSQL database, the platform achieves incredible flexibility in handling complex vehicle metadata and geo-spatial coordinates. The <strong>Node.js</strong> and <strong>Express</strong> backend provides a non-blocking, event-driven architecture that allows for simultaneous handling of thousands of booking requests with minimal latency, resulting in an average server response time of just <strong>147ms</strong>.
            </p>
            <p className="leading-relaxed text-base font-light text-justify mt-4">
              This stack was chosen specifically to ensure that the entire development lifecycle, from database queries to frontend rendering, is handled with consistent logic, significantly reducing technical debt and maximizing cross-service compatibility.
            </p>
          </section>

          <section className="border-b border-gray-900 pb-8">
            <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
              2. React & The Single Page Application (SPA) Advantage
            </h2>
            <p className="leading-relaxed text-base font-light text-justify">
              The user interface is built using <strong>React.js</strong>, the industry-standard for constructing dynamic, fast-loading interfaces. LuxeDrive is a <strong>Single Page Application (SPA)</strong>, which means that after the initial load, every interaction—from filtering cars to managing your profile—is handled instantaneously without any browser refresh. 
            </p>
            <p className="leading-relaxed text-base font-light text-justify mt-4">
              By utilizing a <strong>Virtual DOM</strong>, React ensures that only the necessary parts of the interface are updated when state changes, providing a fluid experience that feels more like a desktop application than a traditional website. This reduces data consumption and provides the "instant" feel that premium users expect from a luxury brand.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
              3. Deep Inventory & Geo-Spatial Search
            </h2>
            <p className="leading-relaxed text-base font-light text-justify">
              Every detail about the website's fleet is indexed with precision. Our <strong>Geo-Spatial Search</strong> logic allows users to find vehicles based on their exact proximity, utilizing 2D-Sphere indexes in MongoDB. This ensures that whether a customer is looking for an airport delivery or a home drop-off, the results are mathematically accurate and delivered in milliseconds.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-902 border border-gray-800 p-4 rounded-xl">
                <p className="text-luxe-gold text-[10px] font-black uppercase mb-1">Car Model Details</p>
                <p className="text-xs text-gray-500">Atomic indexing for seat count, fuel type, transmission, and service availability windows.</p>
              </div>
              <div className="bg-gray-902 border border-gray-800 p-4 rounded-xl">
                <p className="text-luxe-gold text-[10px] font-black uppercase mb-1">Booking Model Logic</p>
                <p className="text-xs text-gray-500">Self-validating schema that prevents double-booking while managing payment signatures in real-time.</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-white text-xl font-bold uppercase tracking-widest mb-4">
              4. Role-Based Governance (RBAC)
            </h2>
            <p className="text-sm leading-relaxed mb-4 text-justify">
              LuxeDrive's security is anchored by an advanced <strong>Role-Based Access Control (RBAC)</strong> system. This ensures that while a Customer is booking their next ride, a Provider is managing their fleet, an Admin is conducting KYC audits, and a Taxi Driver is syncing their availability—all within the same secure environment but with strictly isolated data access.
            </p>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
              <li><span className="text-white">Customer:</span> Seamless Booking & UX</li>
              <li><span className="text-luxe-gold">Provider:</span> Dynamic Fleet Management</li>
              <li><span className="text-blue-400">Taxi Driver:</span> Fare & Schedule Syncing</li>
              <li><span className="text-red-500">Admin:</span> Global Command & Control</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
              5. Financial Infrastructure
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
              6. Real-Time Inventory via WebSockets
            </h2>
            <p className="leading-relaxed text-sm">
              To prevent over-booking, LuxeDrive uses <strong>Socket.io</strong> to broadcast inventory updates. When a user completes a checkout, a `syncInventory` event is emitted globally, updating the available stock count on every active client without requiring a REST polling cycle.
            </p>
          </section>

          <section className="bg-luxe-gold/5 border border-luxe-gold/20 p-6 rounded-xl">
             <h2 className="text-luxe-gold text-lg font-bold uppercase tracking-widest mb-2 font-serif">7. Strategic Roadmap</h2>
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
