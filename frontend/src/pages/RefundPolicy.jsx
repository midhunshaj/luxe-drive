import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const RefundPolicy = () => {
  return (
    <>
      <SEO title="Refund Policy | LuxeDrive" description="Refund and Cancellation Policy for LuxeDrive vehicle bookings and donations." />
      <div className="pt-44 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4">
              Refund <span className="text-luxe-gold">Policy</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
              Cancellations & Refunds
            </p>
          </motion.div>

          <div className="prose prose-invert prose-luxe max-w-none space-y-8">
            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                1. Booking Cancellations
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We understand that plans can change. Our cancellation policy is designed to be fair to both our clients and our fleet management operations. 
              </p>
              <ul className="list-disc pl-6 text-gray-400 font-light mt-4 space-y-2">
                <li>Cancellations made more than 48 hours before the scheduled rental period will receive a full refund, minus a 5% processing fee.</li>
                <li>Cancellations made between 24 and 48 hours before the scheduled rental period will receive a 50% refund.</li>
                <li>Cancellations made less than 24 hours before the scheduled rental period, or no-shows, are non-refundable.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                2. Security Deposits
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Any security deposits held during the rental period will be released within 3-5 business days after the vehicle is returned, inspected, and confirmed to be in the same condition as when it was delivered. If damages or additional charges (e.g., tolls, fuel shortages, excessive mileage) apply, these will be deducted from the deposit before the remainder is refunded.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                3. Donations and Contributions
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                All donations and contributions made to support LuxeDrive via the platform (including the "Buy me a coffee" feature) are final and non-refundable. We appreciate your support in helping us maintain and expand our services.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                4. Processing Time
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Approved refunds will be processed automatically to the original method of payment. Please allow up to 7-10 business days for the credit to appear on your statement, depending on your card issuer's policies.
              </p>
            </section>
          </div>

          <div className="mt-16">
            <GoogleAd slot="REPLACE_WITH_REFUND_SLOT" />
          </div>
        </div>
      </div>
    </>
  );
};

export default RefundPolicy;
