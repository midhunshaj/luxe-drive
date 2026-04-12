import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Plane, Car, MapPin, Calendar, CheckCircle, ChevronDown } from 'lucide-react';

const BookingWidget = () => {
  const [activeTab, setActiveTab] = useState('home'); // home, airport, yard
  const [dropOffSame, setDropOffSame] = useState(true);

  const tabs = [
    { id: 'home', label: 'HOME DELIVERY', icon: Home },
    { id: 'airport', label: 'AIRPORT DELIVERY', icon: Plane },
    { id: 'yard', label: 'PICKUP FROM YARD', icon: Car },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-md rounded-[2rem] shadow-[0_25px_100px_rgba(0,0,0,0.3)] p-8 w-full max-w-[440px] border border-white/20 relative z-20"
    >
      <div className="bg-gradient-to-r from-luxe-gold to-yellow-400 px-6 py-4 -mx-8 -mt-8 rounded-t-[2rem] mb-8 shadow-inner">
        <h2 className="text-black font-black text-xl tracking-tight text-center uppercase">
          Find Your Perfect Drive
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-3.5 rounded-xl text-[9px] font-black tracking-widest transition-all duration-500 ${
              activeTab === tab.id 
                ? 'bg-white text-black shadow-xl shadow-black/5 ring-1 ring-black/5' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-luxe-gold text-black' : 'bg-gray-100 text-gray-400'}`}>
               <tab.icon size={16} strokeWidth={2.5} />
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drop off toggle */}
      <div className="flex items-center justify-between mb-8 px-2">
        <span className="text-gray-900 font-extrabold text-sm uppercase tracking-tight">Drop Off at same location</span>
        <button 
          onClick={() => setDropOffSame(!dropOffSame)}
          className={`relative w-14 h-7 rounded-full transition-all duration-500 shadow-inner ${dropOffSame ? 'bg-luxe-gold' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-500 ease-out ${dropOffSame ? 'translate-x-7' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Pick up location */}
      <div className="mb-8">
        <div className="flex justify-between items-end mb-2.5 px-1">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {activeTab === 'airport' ? 'Pickup Airport' : 'Pick-up Location'}
          </label>
          <span className="bg-luxe-gold/20 text-luxe-gold font-black px-2 py-1 rounded text-[9px] uppercase tracking-tighter border border-luxe-gold/30">
             Active: 9 AM - 6 PM
          </span>
        </div>
        <div className="relative group">
          <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-luxe-gold group-focus-within:scale-110 transition-transform" size={20} />
          <input 
            type="text" 
            placeholder={activeTab === 'airport' ? 'Enter Airport Name' : 'Enter city or street address'}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-6 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-luxe-gold/50 focus:bg-white font-bold transition-all shadow-sm group-hover:bg-white group-hover:border-gray-200"
            defaultValue={activeTab === 'airport' ? 'Cochin Intl Airport (COK)' : 'QPQX G3, Chemmeruthy, TVM'}
          />
        </div>
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-2 gap-5 mb-8">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Pick-up Date</label>
          <div className="relative group">
            <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-luxe-gold transition-colors" size={18} />
            <input 
              type="text" 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4.5 px-5 text-gray-900 text-sm focus:outline-none focus:bg-white font-bold transition-all shadow-sm"
              defaultValue="16 Apr 10:37 AM"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 px-1">Drop-off Date</label>
          <div className="relative group">
            <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-luxe-gold transition-colors" size={18} />
            <input 
              type="text" 
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4.5 px-5 text-gray-900 text-sm focus:outline-none focus:bg-white font-bold transition-all shadow-sm"
              defaultValue="30 Apr 06:00 PM"
            />
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="flex gap-4 mb-10 px-1">
        <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white">
            <CheckCircle size={10} />
          </div>
          24/7 Support
        </div>
        <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-wider">
          <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white">
            <CheckCircle size={10} />
          </div>
          KM Package
        </div>
      </div>

      {/* Submit Button */}
      <button className="relative w-full bg-black text-white font-black uppercase py-5 rounded-2xl shadow-2xl hover:bg-gray-900 transition-all text-xs tracking-[0.2em] group overflow-hidden">
        <span className="relative z-10">Check Availability</span>
        <div className="absolute inset-0 bg-luxe-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <span className="absolute inset-0 flex items-center justify-center text-black font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
           Explore Fleet
        </span>
      </button>

      {activeTab === 'airport' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-luxe-gold/10 border border-luxe-gold/20 rounded-2xl text-[10px] text-gray-700 font-bold flex items-start gap-3 backdrop-blur-sm"
        >
           <Plane size={16} className="text-luxe-gold shrink-0 mt-0.5" />
           <p className="leading-relaxed">
             <span className="text-black uppercase">Taxi Mode:</span> Professional chauffeurs will monitor your flight and meet you at the terminal. Fixed pricing with no surge.
           </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookingWidget;
