import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO title="Privacy Policy | LuxeDrive" description="Privacy Policy for LuxeDrive. Learn how we collect, use, and protect your personal information." />
      <div className="pt-44 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4">
              Privacy <span className="text-luxe-gold">Policy</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
              Effective Date: January 1, 2026
            </p>
          </motion.div>

          <div className="prose prose-invert prose-luxe max-w-none space-y-8">
            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                1. Introduction
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                Welcome to LuxeDrive ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@midhunshaj.in.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                2. Information We Collect
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We collect personal information that you voluntarily provide to us when registering on the LuxeDrive platform, expressing an interest in obtaining information about us or our products and services, when participating in activities on the platform, or otherwise contacting us.
              </p>
              <ul className="list-disc pl-6 text-gray-400 font-light mt-4 space-y-2">
                <li>Personal Data: Name, email address, phone number, and physical address.</li>
                <li>Payment Data: We collect data necessary to process your payment if you make purchases, such as your payment instrument number (such as a credit card number), and the security code associated with your payment instrument. All payment data is stored by Razorpay.</li>
                <li>Usage Data: Information about how you use our website and services, including IP addresses, browser types, and interactions with our platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                3. How We Use Your Information
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We use personal information collected via our platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
              <ul className="list-disc pl-6 text-gray-400 font-light mt-4 space-y-2">
                <li>To facilitate account creation and logon process.</li>
                <li>To fulfill and manage your orders and bookings.</li>
                <li>To send administrative information to you.</li>
                <li>To protect our Services and maintain platform security.</li>
                <li>To enforce our terms, conditions, and policies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                4. Sharing Your Information
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We may share your data with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                5. Google AdSense & Cookies
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We use third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.
              </p>
              <p className="leading-relaxed text-base font-light text-justify mt-4">
                Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the DART cookie enables it to serve ads to our users based on previous visits to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy.
              </p>
            </section>
            
            <section>
              <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                6. Security of Your Information
              </h2>
              <p className="leading-relaxed text-base font-light text-justify">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </section>
          </div>

          <div className="mt-16">
            <GoogleAd slot="REPLACE_WITH_PRIVACY_SLOT" />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
