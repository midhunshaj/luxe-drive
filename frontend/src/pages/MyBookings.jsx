import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/bookings/mybookings', config);
        setBookings(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load bookings", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5 }}
           className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mb-4">
            My <span className="text-luxe-gold">Reservations</span>
          </h2>
          <p className="text-gray-400 text-lg flex items-center justify-center gap-2">
            Your exclusive vehicle history
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center text-luxe-gold mb-8 text-xl font-bold animate-pulse">Syncing Encrypted Logs...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 text-lg">You have no active or past reservations.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={booking.car?.images && booking.car.images.length > 0 ? booking.car.images[0] : 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80'}
                    alt="Car"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className={`absolute top-4 right-4 backdrop-blur px-3 py-1 rounded text-xs font-bold border ${booking.paymentStatus === 'paid' ? 'bg-green-900/80 text-green-400 border-green-500' : 'bg-red-900/80 text-red-400 border-red-500'}`}>
                    {booking.paymentStatus.toUpperCase()}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-wide mb-1">{booking.car?.make || 'Deleted'} <span className="text-luxe-gold">{booking.car?.model || 'Vehicle'}</span></h3>
                    <p className="text-gray-400 text-xs tracking-widest uppercase mb-4">{booking.car?.category || 'Unknown'}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Total Paid:</span>
                        <span className="text-luxe-gold font-semibold">₹ {booking.totalCost?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Date Reserved:</span>
                        <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Start Date:</span>
                        <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Order ID:</span>
                        <span className="truncate w-32 text-right opacity-70" title={booking.razorpayOrderId}>{booking.razorpayOrderId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
