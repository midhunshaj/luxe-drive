import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const TermsOfService = () => {
  return (
    <>
      <SEO title="Terms of Service | LuxeDrive" description="Terms of Service and conditions for using the LuxeDrive platform and services." />
      <div className="pt-44 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4">
              Terms of <span className="text-luxe-gold">Service</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
              Effective Date: January 1, 2026
            </p>
          </motion.div>

          <div className="prose prose-invert prose-luxe max-w-none space-y-8">
            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                By accessing and using LuxeDrive ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using this Platform's particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                2. Use of Service
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                The Platform provides users with access to a collection of luxury vehicle rental services, documentation, and booking tools. You agree to use the Platform only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the Platform.
              </p>
              <ul className="list-disc pl-6 text-gray-400 font-light mt-4 space-y-2">
                <li>You must be at least 21 years of age to book a vehicle.</li>
                <li>You must possess a valid driver's license and adequate insurance coverage.</li>
                <li>You agree not to use the vehicles for any illegal activities, racing, or unauthorized subleasing.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                3. Bookings and Payments
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                All bookings are subject to availability and confirmation. Prices are subject to change without notice prior to booking confirmation. Payments are processed securely via our third-party payment gateway, Razorpay. By making a booking, you authorize us to charge the provided payment method for the total amount of the reservation, including any applicable deposits or fees.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                4. Intellectual Property
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                The content, organization, graphics, design, compilation, magnetic translation, digital conversion and other matters related to the Platform are protected under applicable copyrights, trademarks and other proprietary (including but not limited to intellectual property) rights. The copying, redistribution, use or publication by you of any such matters or any part of the Platform is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                5. Limitation of Liability
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                In no event shall LuxeDrive, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                6. Changes to Terms
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>
          </div>

          <div className="mt-16">
            <GoogleAd slot="REPLACE_WITH_TERMS_SLOT" />
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfService;
