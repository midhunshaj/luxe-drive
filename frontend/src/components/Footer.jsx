import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-luxe-dark border-t border-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10">
          <a href="/about" className="text-gray-400 hover:text-luxe-gold text-xs uppercase tracking-[0.2em] transition-colors">About Us</a>
          <a href="/contact" className="text-gray-400 hover:text-luxe-gold text-xs uppercase tracking-[0.2em] transition-colors">Contact Us</a>
          <a href="/privacy-policy" className="text-gray-400 hover:text-luxe-gold text-xs uppercase tracking-[0.2em] transition-colors">Privacy Policy</a>
          <a href="/terms-of-service" className="text-gray-400 hover:text-luxe-gold text-xs uppercase tracking-[0.2em] transition-colors">Terms of Service</a>
          <a href="/refund-policy" className="text-gray-400 hover:text-luxe-gold text-xs uppercase tracking-[0.2em] transition-colors">Refund Policy</a>
        </div>
        <div className="text-center">
          <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-bold mb-4">
            &copy; 2026 LUXEDRIVE INTERNATIONAL. All Rights Reserved.
          </p>
          <p className="text-gray-600 text-[10px] tracking-[0.2em] uppercase">
            Handcrafted with precision by <span className="text-luxe-gold/80 italic font-serif text-xs capitalize">Midhun Shaj</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
