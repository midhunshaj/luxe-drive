import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GoogleAd from '../components/GoogleAd';

const LandingPage = () => {
  const handleDonation = async () => {
    try {
      const { data: order } = await axios.post('/api/bookings/donate');
      
      if (typeof window === 'undefined' || !window.Razorpay) {
        alert("Payment Gateway Error. Please refresh.");
        return;
      }

      const options = {
        key: 'rzp_live_SX7dA0kgUoreAg', // Use live key for donations
        amount: order.amount,
        currency: order.currency,
        name: "Support LuxeDrive",
        description: "Buy me a coffee!",
        order_id: order.id,
        handler: function (response) {
          alert(`Thank you for your donation of ₹49! ❤️ Transaction ID: ${response.razorpay_payment_id}`);
        },
        prefill: { name: "Valued Visitor" },
        theme: { color: "#FF5F5F" } // Coffee Red
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
       console.error(error);
       alert("Failed to initiate donation. Try again later.");
    }
  };

  return (
    <>
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
            
            <Link to="/documentation">
              <button className="border border-white text-white font-bold uppercase text-sm tracking-widest px-10 py-4 rounded hover:bg-white hover:text-black transition-all duration-300">
                Documentation
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
      
      {/* Donation Section */}
      <div className="bg-luxe-dark py-20 border-t border-gray-900 overflow-hidden relative">
         {/* Animated background highlights */}
         <div className="absolute top-0 left-1/4 w-64 h-64 bg-luxe-gold/5 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>

         <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-xl mx-auto"
            >
              <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-[0.2em]">Crafted For Perfection.</h3>
              <p className="text-gray-400 mb-10 font-light">
                If you enjoy the LuxeDrive experience, help me keep the high-octane servers running smoothly!
              </p>

              <motion.button
                onClick={handleDonation}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(255, 95, 95, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-12 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-red-600 via-pink-600 to-orange-500 rounded-full hover:from-red-500 hover:to-orange-400 animate-gradient-x shadow-xl overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-shimmer"></span>
                <span className="relative flex items-center tracking-[0.15em] uppercase text-sm">
                  ☕ Buy me a coffee!! <span className="ml-3 text-lg">₹49</span>
                </span>
              </motion.button>
              
              <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                 ⚡ Secured via Razorpay Live
              </p>
            </motion.div>
         </div>
      </div>
      
      {/* Premium Google Ad Slot */}
      <div className="bg-luxe-dark pb-20">
        <div className="max-w-4xl mx-auto px-4">
           <GoogleAd slot="REPLACE_WITH_LANDING_PAGE_SLOT_ID" />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
