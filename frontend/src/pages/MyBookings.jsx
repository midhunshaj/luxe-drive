import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import io from 'socket.io-client';

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

    const socket = io(window.location.origin.replace('5173', '5000'));
    socket.emit('join', user._id);

    socket.on('statusUpdate', (data) => {
      setBookings((prevBookings) =>
        prevBookings.map((b) =>
          b._id === data.bookingId ? { ...b, dealerStatus: data.dealerStatus } : b
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-luxe-dark text-white pb-32">
      <section className="relative pt-44 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 blur-3xl pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-luxe-gold/10 rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-luxe-gold font-bold">Personal Archives</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-serif"
          >
            My <span className="text-gradient">Reservations</span>
          </motion.h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-t-2 border-luxe-gold rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold">Retrieving Credentials</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-40 glass-card">
            <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">No active reservations found in your history.</p>
            <Link to="/fleet" className="inline-block mt-8 text-[10px] uppercase tracking-[0.3em] text-luxe-gold hover:text-white transition-colors">Start Your Journey →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="group relative bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col md:flex-row h-auto md:h-[300px]"
              >
                <div className="md:w-2/5 h-48 md:h-full overflow-hidden relative">
                  <img
                    src={booking.car?.images && booking.car.images.length > 0 ? booking.car.images[0] : 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80'}
                    alt="Car"
                    className="w-full h-full object-cover transform scale-[1.05] group-hover:scale-100 transition-transform duration-[1.5s] ease-out opacity-80"
                  />
                  <div className={`absolute top-6 left-6 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md ${booking.paymentStatus === 'paid' ? 'bg-white/5 border-green-500/50 text-green-400' : 'bg-white/5 border-red-500/50 text-red-400'}`}>
                    {booking.paymentStatus}
                  </div>
                </div>

                <div className="md:w-3/5 p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="font-serif">
                      <h3 className="text-2xl text-white mb-1 leading-none">{booking.car?.make || 'Deleted'}</h3>
                      <p className="text-luxe-gold italic text-lg">{booking.car?.model || 'Vehicle'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1">Commencement</span>
                        <span className="text-xs text-white/80 font-light">{new Date(booking.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1">Total Fee</span>
                        <span className="text-xs text-white/80 font-light">₹{booking.totalCost?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-widest text-gray-500 font-bold mb-1">Reference</span>
                      <span className="text-[9px] text-white/30 font-mono truncate w-32 uppercase tracking-tighter" title={booking.razorpayOrderId}>{booking.razorpayOrderId}</span>
                    </div>
                    
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${
                      booking.dealerStatus === 'accepted' ? 'text-green-400 border-green-500/30 bg-green-500/5' :
                      booking.dealerStatus === 'rejected' ? 'text-red-400 border-red-500/30 bg-red-500/5' :
                      'text-yellow-400 border-yellow-500/30 bg-yellow-500/5'
                    }`}>
                      {booking.dealerStatus === 'accepted' ? 'Booked' : booking.dealerStatus || 'Pending'}
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
