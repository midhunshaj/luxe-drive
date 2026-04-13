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
        key: 'rzp_live_SX7dA0kgUoreAg',
        amount: order.amount,
        currency: order.currency,
        name: "Support LuxeDrive",
        description: "Buy me a coffee!",
        order_id: order.id,
        handler: function (response) {
          alert(`Thank you for your donation of ₹49! ❤️ Transaction ID: ${response.razorpay_payment_id}`);
        },
        prefill: { name: "Valued Visitor" },
        theme: { color: "#C5A059" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
       console.error(error);
       alert("Failed to initiate donation. Try again later.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="bg-luxe-dark min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden px-4 pt-24">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="w-full h-full bg-center bg-cover"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-luxe-dark/50 to-luxe-dark" />
          <div className="absolute inset-0 bg-luxe-dark/40" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-6xl mx-auto text-center px-4"
        >


          <motion.h1 variants={itemVariants} className="text-5xl md:text-9xl font-serif text-white mb-6 md:mb-8 leading-[1.1] md:leading-[0.9]">
            Beyond First <br />
            <span className="text-gradient font-serif italic pr-4">Class</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-gray-400 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed mb-10 md:mb-12">
            An curated collection of the world's most exceptional automobiles. <br className="hidden md:block" />
            Designed for those who demand nothing short of perfection.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <Link to="/fleet" className="group relative w-full md:w-auto">
              <div className="absolute -inset-0.5 bg-luxe-gold opacity-30 blur group-hover:opacity-60 transition duration-500 rounded-full hidden md:block" />
              <button className="relative w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-luxe-gold text-black font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] rounded-full hover:bg-luxe-gold-light transition-all duration-300">
                Explore Fleet
              </button>
            </Link>
            
            <Link to="/documentation" className="w-full md:w-auto">
              <button className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-white/5 hover:bg-white/10 text-white font-bold uppercase text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.3em] rounded-full border border-white/10 backdrop-blur-md transition-all duration-300">
                Our Story
              </button>
            </Link>
          </motion.div>
        </motion.div>


      </section>

      {/* Featured Details Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-luxe-gold/5 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-serif mb-6">Redefining <br />The Road.</h2>
              <p className="text-gray-400 text-lg font-light leading-relaxed">
                We don't just rent cars; we provide keys to a lifestyle. Every vehicle in our fleet is meticulously maintained and delivered with white-glove service.
              </p>
            </div>
            <div className="text-right">
              <div className="text-7xl font-serif text-luxe-gold">01</div>
              <div className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold">Unrivaled Quality</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Immediate Delivery", desc: "Your time is your most precious asset. We respect it.", icon: "⚡" },
              { title: "World-wide Support", desc: "No matter where the road takes you, we are there.", icon: "🌍" },
              { title: "Bespoke Experience", desc: "Tailored to your specific needs and desires.", icon: "✨" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-10 group hover:border-luxe-gold/30 transition-all duration-500"
              >
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-serif mb-4 group-hover:text-luxe-gold transition-colors">{item.title}</h3>
                <p className="text-gray-500 font-light leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation (Support) Section */}
      <section className="py-32 bg-luxe-dark-soft relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto glass-card p-12 md:p-20 text-center relative overflow-hidden border-luxe-gold/20">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-luxe-gold/10 rounded-full blur-3xl" />
            
            <h3 className="text-3xl md:text-5xl font-serif mb-8">Fuel Our Vision.</h3>
            <p className="text-gray-400 mb-12 max-w-xl mx-auto font-light leading-relaxed">
              LuxeDrive is a passion project dedicated to engineering excellence and aesthetic perfection. Your support helps us keep the servers running and the fleet expanding.
            </p>

            <motion.button
              onClick={handleDonation}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group bg-white text-black font-bold uppercase text-[10px] tracking-[0.4em] px-16 py-6 rounded-full overflow-hidden transition-all duration-500"
            >
              <div className="absolute inset-0 bg-luxe-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative z-10 group-hover:text-white transition-colors duration-500 flex items-center justify-center">
                ☕ Contribute ₹49
              </span>
            </motion.button>
            
            <p className="mt-8 text-[10px] text-gray-600 uppercase tracking-widest font-bold">
               Secured via Razorpay Live
            </p>
          </div>
        </div>
      </section>
      
      {/* Ads Section */}
      <section className="bg-luxe-dark pb-32">
        <div className="max-w-4xl mx-auto px-4">
           <GoogleAd slot="REPLACE_WITH_LANDING_PAGE_SLOT_ID" />
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
