import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative pt-20 pb-32 flex content-center items-center justify-center min-h-screen bg-luxe-dark">
      
      {/* Background Image Overlay */}
      <div 
        className="absolute top-0 w-full h-full bg-center bg-cover" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80')" }}
      >
        <div className="w-full h-full absolute opacity-70 bg-black"></div>
        {/* Subtle gradient to blend into the dark theme */}
        <div className="w-full h-full absolute top-0 bg-gradient-to-b from-transparent to-luxe-dark"></div>
      </div>
      
      {/* Hero Content */}
      <div className="container relative mx-auto px-4 z-10 flex flex-col items-center pt-24">
        <motion.h1 
          initial={{ y: 50, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-white font-bold text-6xl md:text-8xl text-center tracking-tight"
        >
          Beyond First <span className="text-luxe-gold italic font-serif">Class</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 text-xl md:text-2xl text-gray-300 max-w-3xl text-center font-light leading-relaxed"
        >
          Experience the thrill of the world's most exclusive fleet. Delivered immediately to your doorstep, anywhere on the map.
        </motion.p>
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }} 
           animate={{ opacity: 1, scale: 1 }} 
           transition={{ duration: 0.5, delay: 0.6 }}
           className="mt-12 flex space-x-6"
        >
          <Link to="/fleet">
            <button className="bg-luxe-gold text-black font-bold uppercase text-sm tracking-widest px-10 py-4 rounded shadow-[0_0_20px_rgba(212,175,55,0.5)] hover:bg-yellow-500 transition-all duration-300">
              View The Fleet
            </button>
          </Link>
          
          <button className="border border-white text-white font-bold uppercase text-sm tracking-widest px-10 py-4 rounded hover:bg-white hover:text-black transition-all duration-300">
            Learn More
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
