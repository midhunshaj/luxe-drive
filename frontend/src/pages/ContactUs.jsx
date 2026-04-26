import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import GoogleAd from '../components/GoogleAd';

const ContactUs = () => {
  return (
    <>
      <SEO title="Contact Us | LuxeDrive" description="Get in touch with the LuxeDrive team for inquiries, support, or feedback." />
      <div className="pt-44 pb-20 min-h-screen bg-luxe-dark text-gray-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-[0.2em] mb-4">
              Contact <span className="text-luxe-gold">Us</span>
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto uppercase tracking-widest text-[9px] font-bold">
              We Are Here To Assist You
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <section>
                <h2 className="text-white text-xl font-bold uppercase tracking-widest border-l-4 border-luxe-gold pl-4 mb-4 font-serif italic">
                  Get in Touch
                </h2>
                <p className="leading-relaxed text-base font-light text-justify">
                  Whether you have a question about our fleet, need assistance with a booking, or require bespoke concierge services, our dedicated team is available to assist you. 
                </p>
              </section>

              <div className="space-y-4">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-luxe-gold text-sm font-bold uppercase tracking-widest mb-2">Email Inquiries</h3>
                  <p className="text-gray-400 font-light">support@midhunshaj.in</p>
                </div>
                
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-luxe-gold text-sm font-bold uppercase tracking-widest mb-2">Direct Line</h3>
                  <p className="text-gray-400 font-light">+91 (800) LUXE-DRV</p>
                </div>

                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <h3 className="text-luxe-gold text-sm font-bold uppercase tracking-widest mb-2">Corporate Headquarters</h3>
                  <p className="text-gray-400 font-light">
                    LuxeDrive Tower, Tech Park<br />
                    Bangalore, Karnataka, India
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/30 p-8 rounded-2xl border border-gray-800">
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Thank you for reaching out. We will get back to you shortly.'); }}>
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                  <input type="text" id="name" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxe-gold transition-colors" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                  <input type="email" id="email" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxe-gold transition-colors" required />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Message</label>
                  <textarea id="message" rows="5" className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-luxe-gold transition-colors" required></textarea>
                </div>
                <button type="submit" className="w-full bg-luxe-gold text-black font-bold uppercase tracking-[0.2em] py-4 rounded-lg hover:bg-luxe-gold-light transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>

          <div className="mt-16">
            <GoogleAd slot="REPLACE_WITH_CONTACT_SLOT" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;
