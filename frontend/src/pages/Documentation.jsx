import React from 'react';
import { motion } from 'framer-motion';
import GoogleAd from '../components/GoogleAd';

const Documentation = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-gray-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-white text-4xl md:text-6xl font-black uppercase tracking-[0.2em] mb-6">
            Technical <span className="text-luxe-gold">Architecture</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-sm font-bold">
            A Deep Dive into the LuxeDrive Full-Stack Ecosystem
          </p>
        </motion.div>

        {/* Ad Slot */}
        <div className="mb-12">
          <GoogleAd slot="REPLACE_WITH_DOCS_TOP_SLOT" />
        </div>

        {/* Content Section */}
        <div className="prose prose-invert prose-luxe max-w-none space-y-12">
          
          <section>
            <h2 className="text-white text-2xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-6 mb-6 font-serif italic">
              1. The MERN Stack Foundation
            </h2>
            <p className="leading-relaxed text-lg font-light">
              LuxeDrive is architected on the <strong>MERN (MongoDB, Express, React, Node.js)</strong> stack, a powerhouse combination for building scalable, data-intensive web applications. By utilizing a unified JavaScript environment, the platform ensures seamless data flow between the client-side interactivity and the server-side logic.
            </p>
            <p className="leading-relaxed mt-4">
              <strong>MongoDB</strong> serves as our primary document-store database, providing the flexibility needed to handle complex data structures like vehicle specifications, nested booking histories, and geo-spatial location data. The use of <strong>Mongoose</strong> as an ODM (Object Data Modeling) library allows for robust schema validation and middleware hooks, ensuring data integrity at every layer.
            </p>
          </section>

          <section className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
            <h2 className="text-white text-2xl font-bold uppercase tracking-widest mb-6">
              2. Advanced State Management & Redux
            </h2>
            <p className="leading-relaxed">
              To handle the platform's high level of interactivity—such as real-time fleet filtering, session persistence, and multi-step booking flows—we employ <strong>Redux Toolkit (RTK)</strong>. 
            </p>
            <ul className="list-disc pl-6 space-y-3 mt-4 text-gray-400">
              <li><strong>Auth Slices:</strong> Manage secure JWT-based authentication tokens and user profiles across the entire app.</li>
              <li><strong>Car Slices:</strong> Handle the global vehicle state, including real-time availability updates via Socket.io.</li>
              <li><strong>Booking Slices:</strong> Orchestrate the transaction flow, from initial selection to payment gateway confirmation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-2xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-6 mb-6 font-serif italic">
              3. Security Architecture & JWT
            </h2>
            <p className="leading-relaxed">
              Security is the cornerstone of the LuxeDrive experience. Our authentication system utilizes <strong>JSON Web Tokens (JWT)</strong> for stateless, secure user sessions. When a user logs in, the backend generates an encrypted token containing the user's signature and permissions (Role-Based Access Control).
            </p>
            <div className="bg-luxe-gold/5 border border-luxe-gold/20 p-6 rounded-xl mt-6">
              <p className="text-xs text-luxe-gold font-black uppercase tracking-widest mb-2">Technical Note: Session Guard</p>
              <p className="text-sm italic">
                We've implemented a custom "Session Guard" middleware that periodically validates the token's integrity against the browser's local storage, preventing "Not Authorized" errors even in unstable network conditions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-white text-2xl font-bold uppercase tracking-widest mb-6">
              4. Payment Gateway & Financial Integrity
            </h2>
            <p className="leading-relaxed">
              Transactions are handled via the <strong>Razorpay Payment Gateway</strong> integration. This ensures that sensitive credit card and banking information never touches our servers, complying with global PCI-DSS standards. The integration uses a dual-verification webhook system:
            </p>
            <ol className="list-decimal pl-6 space-y-4 mt-6 text-gray-400">
              <li><strong>Order Initiation:</strong> The server creates a unique `order_id` in Razorpay's ledger.</li>
              <li><strong>Client Checkout:</strong> The user completes payment via a secure, encrypted modal.</li>
              <li><strong>Server-Side Verification:</strong> Our Node.js backend verifies the Razorpay signature to ensure the payment is authentic before updating the database.</li>
            </ol>
          </section>

          {/* Middle Ad Slot */}
          <div className="py-8">
            <GoogleAd slot="REPLACE_WITH_DOCS_MIDDLE_SLOT" />
          </div>

          <section>
            <h2 className="text-white text-2xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-6 mb-6 font-serif italic">
              5. Real-Time Fleet Operations
            </h2>
            <p className="leading-relaxed">
              For administrative and provider roles, LuxeDrive provides a real-time <strong>Operations Control Panel</strong>. Using <strong>Socket.io</strong>, we maintain a persistent WebSocket connection between the server and the admin dashboard. This allows for instant updates to vehicle stock, booking statuses, and KYC verification queues without requiring a page refresh.
            </p>
          </section>

          <section className="border-t border-gray-900 pt-12 text-center">
            <h3 className="text-luxe-gold font-bold uppercase tracking-widest mb-4 italic">Scaling the Future</h3>
            <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              LuxeDrive is built with a microservices-ready structure, allowing for easy migration to distributed systems as our fleet and user base continue to grow into the next era of luxury mobility.
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
