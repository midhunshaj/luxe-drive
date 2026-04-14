import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-luxe-dark border-t border-gray-900 py-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-gray-500 text-[10px] tracking-[0.3em] uppercase font-bold mb-4">
          &copy; 2026 LUXEDRIVE INTERNATIONAL. All Rights Reserved.
        </p>
        <p className="text-gray-600 text-[10px] tracking-[0.2em] uppercase">
          Handcrafted with precision by <span className="text-luxe-gold/80 italic font-serif text-xs capitalize">Midhun Shaj</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
