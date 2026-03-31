import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCars } from '../features/carSlice';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Fleet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cars, isLoading, isError, message } = useSelector((state) => state.cars);
  const { user } = useSelector((state) => state.auth);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);

  useEffect(() => {
    dispatch(getCars());

    // 🚀 MASTER INJECTION: React directly implants the script globally upon load
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

  }, [dispatch]);

  const displayCars = cars.length > 0 ? cars : [
    { _id: '1', make: 'Rolls Royce', model: 'Phantom', pricePerDay: 250000, category: 'Luxury Sedan', images: ['https://images.unsplash.com/photo-1631269666014-99d9196b0ca7?auto=format&fit=crop&q=80'] },
    { _id: '2', make: 'Lamborghini', model: 'Aventador S', pricePerDay: 320000, category: 'Supercar', images: ['https://images.unsplash.com/photo-1544839655-a03be81a8b27?auto=format&fit=crop&q=80'] },
    { _id: '3', make: 'Mercedes-Benz', model: 'G63 AMG', pricePerDay: 180000, category: 'Luxury SUV', images: ['https://images.unsplash.com/photo-1520050206274-a1df22f84cb5?auto=format&fit=crop&q=80'] },
  ];

  const handleBookingClick = async (car) => {
    if (!user) {
      alert("Please Sign In first to reserve an ultra-luxury vehicle.");
      navigate('/login');
      return;
    }

    try {
      setPaymentLoadingId(car._id);

      // Verify the Razorpay SDK injection succeeded
      if (typeof window === 'undefined' || !window.Razorpay) {
        alert("CRITICAL WARNING: The Razorpay Gateway failed to open! If you are on Live Server, Cloudflare or AWS is actively destroying the script. Try Incognito mode or check Chrome Console for CSP blockers.");
        setPaymentLoadingId(null);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };

      const { data: order } = await axios.post('/api/bookings/checkout', {
        carId: car._id,
        pricePerDay: car.pricePerDay
      }, config);

      if (!order || !order.id) {
        alert("Server failed to generate Razorpay transaction.");
        setPaymentLoadingId(null);
        return;
      }

      const options = {
        key: 'rzp_live_SX2YsVi2Jbh7Dh', // Your exact live key
        amount: order.amount,
        currency: order.currency,
        name: "LuxeDrive Premium",
        description: `1-Day VVIP Reservation: ${car.make} ${car.model}`,
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=200&q=80",
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/bookings/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              carId: car._id,
              pricePerDay: car.pricePerDay,
              rentalDays: 1,
            }, config);

            if (verifyRes.data.success) {
               alert(`Payment Verified! Transaction ID: ${response.razorpay_payment_id}`);
               navigate('/my-bookings'); 
            }
          } catch (err) {
            alert("Payment Verification Failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#D4AF37"
        }
      };

      const razorpayWindow = new window.Razorpay(options);
      razorpayWindow.on('payment.failed', function (response) {
        alert("Payment declined: " + response.error.description);
      });
      
      razorpayWindow.open();
      setPaymentLoadingId(null);

    } catch (error) {
      console.error(error);
      alert('Razorpay Order connection severely failed. Verify Backend is operational.');
      setPaymentLoadingId(null);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4">
            Our Exclusive <span className="text-luxe-gold">Fleet</span>
          </h2>
          <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
            Browse our real-time inventory of ultra-luxury vehicles.
          </p>
        </motion.div>

        {isError && <div className="text-center text-red-500 mb-8">{message}</div>}
        {isLoading && <div className="text-center text-luxe-gold mb-8 text-xl font-bold animate-pulse">Syncing Database Inventory...</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {displayCars.map((car, index) => (
             <motion.div
               key={car._id}
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)] group"
             >
               <div className="h-64 overflow-hidden relative">
                 <img
                   src={car.images[0] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80'}
                   alt={`${car.make} ${car.model}`}
                   className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                 />
                 <div className="absolute top-4 right-4 bg-luxe-dark/80 backdrop-blur text-luxe-gold px-4 py-1.5 rounded text-sm font-bold border border-luxe-gold/30">
                   ₹ {car.pricePerDay.toLocaleString('en-IN')} / Day
                 </div>
               </div>
               
               <div className="p-6 relative">
                 <h3 className="text-2xl font-bold tracking-wide mb-1">{car.make} <span className="text-luxe-gold">{car.model}</span></h3>
                 <p className="text-gray-400 text-xs tracking-widest uppercase mb-6">{car.category}</p>
                 
                 <button
                   onClick={() => handleBookingClick(car)}
                   disabled={paymentLoadingId === car._id}
                   className="w-full border border-gray-600 hover:border-luxe-gold hover:text-black hover:bg-luxe-gold transition-colors duration-300 py-3 rounded uppercase text-sm font-bold tracking-widest shadow-md flex items-center justify-center"
                 >
                   {paymentLoadingId === car._id ? 'Securing Portal...' : 'Book via Razorpay'}
                 </button>
               </div>
             </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fleet;
