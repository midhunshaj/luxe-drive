import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCars } from '../features/carSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';

const Fleet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cars, isLoading } = useSelector((state) => state.cars);
  const { user } = useSelector((state) => state.auth);

  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [bookingData, setBookingData] = useState({
    deliveryLocation: '', licenseNo: '', phoneNo: ''
  });

  // Real-time Locking State
  const [lockedCars, setLockedCars] = useState({}); // { carId: userId }
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    dispatch(getCars());
    
    // --- Initialize Real-time Conflict Prevention ---
    const newSocket = io(window.location.origin.replace('5173', '5000'));
    setSocket(newSocket);

    newSocket.on('initialLocks', (locks) => setLockedCars(locks));
    newSocket.on('carLocked', ({ carId, userId }) => {
      setLockedCars(prev => ({ ...prev, [carId]: userId }));
    });
    newSocket.on('carUnlocked', (carId) => {
      setLockedCars(prev => {
        const newLocks = { ...prev };
        delete newLocks[carId];
        return newLocks;
      });
    });

    return () => newSocket.disconnect();
  }, [dispatch]);

  const handleBookingClick = (car) => {
    if (!user) {
      alert("Please Sign In first to reserve an ultra-luxury vehicle.");
      navigate('/login');
      return;
    }
    
    // Check if someone else already has the modal open
    if (lockedCars[car._id] && lockedCars[car._id] !== user._id) {
      alert("This vehicle is currently being reserved by another client. Please wait 60 seconds.");
      return;
    }

    setSelectedCar(car);
    setBookingData({ deliveryLocation: '', licenseNo: '', phoneNo: user.phone || '' });
    setShowModal(true);
    
    // BROADCAST: This car is now busy
    socket.emit('lockCar', { carId: car._id, userId: user._id });
  };

  const closeModal = () => {
    setShowModal(false);
    if (selectedCar && socket) {
      socket.emit('unlockCar', selectedCar._id);
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    if (!bookingData.deliveryLocation || !bookingData.licenseNo || !bookingData.phoneNo) {
      alert("Please fill in all details.");
      return;
    }

    try {
      setShowModal(false);
      setPaymentLoadingId(selectedCar._id);

      if (typeof window === 'undefined' || !window.Razorpay) {
        alert("Payment Gateway Error. Please refresh.");
        setPaymentLoadingId(null);
        socket.emit('unlockCar', selectedCar._id);
        return;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: order } = await axios.post('/api/bookings/checkout', {
        carId: selectedCar._id,
        pricePerDay: selectedCar.pricePerDay
      }, config);

      const options = {
        key: 'rzp_live_SX7dA0kgUoreAg',
        amount: order.amount,
        currency: order.currency,
        name: "LuxeDrive Premium",
        description: `Reservation: ${selectedCar.make} ${selectedCar.model}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post('/api/bookings/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              carId: selectedCar._id,
              pricePerDay: selectedCar.pricePerDay,
              rentalDays: 1,
              deliveryLocation: bookingData.deliveryLocation,
              licenseNo: bookingData.licenseNo,
              phoneNo: bookingData.phoneNo
            }, config);

            if (verifyRes.data.success) {
               alert(`Payment Verified! Transaction ID: ${response.razorpay_payment_id}`);
               socket.emit('unlockCar', selectedCar._id); // Release lock on success
               navigate('/my-bookings'); 
            }
          } catch (err) {
            console.error(err);
            alert("Verification Failed.");
            socket.emit('unlockCar', selectedCar._id);
          }
        },
        modal: {
          ondismiss: function() {
            socket.emit('unlockCar', selectedCar._id);
            setPaymentLoadingId(null);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#D4AF37" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentLoadingId(null);

    } catch (error) {
      console.error(error);
      alert('Order Setup Failed.');
      setPaymentLoadingId(null);
      socket.emit('unlockCar', selectedCar._id);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-4">
            The <span className="text-luxe-gold">Elite</span> Fleet
          </h2>
          <p className="text-gray-400 text-lg uppercase tracking-widest">Hand-selected luxury for global citizens</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-20 text-luxe-gold text-xl animate-pulse tracking-widest uppercase">Initializing Fleet Inventory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {cars.map((car, index) => {
              const isLocked = lockedCars[car._id] && lockedCars[car._id] !== user?._id;
              
              return (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative bg-[#0a0a0a] border border-gray-900 rounded-2xl overflow-hidden hover:border-luxe-gold/50 transition-all duration-500"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold text-luxe-gold border border-luxe-gold/20">
                      {car.category}
                    </div>
                    {isLocked && (
                       <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-red-600 text-white px-4 py-2 rounded font-bold uppercase tracking-tighter animate-pulse">
                             ⚠️ Out of Order (Being Reserved)
                          </span>
                       </div>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-1">{car.make} <span className="text-luxe-gold">{car.model}</span></h3>
                        <p className="text-gray-500 text-sm font-medium">{car.year} Production Model</p>
                        <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${car.countInStock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          Availability: {car.countInStock || 0} Units Remain
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-luxe-gold text-2xl font-black">₹{car.pricePerDay.toLocaleString()}</p>
                        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Per Day</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookingClick(car)}
                      disabled={isLocked || paymentLoadingId === car._id || (car.countInStock <= 0)}
                      className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${
                        (isLocked || car.countInStock <= 0)
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700 scale-95'
                          : 'bg-white text-black hover:bg-luxe-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]'
                      }`}
                    >
                      {paymentLoadingId === car._id ? 'Processing...' : (car.countInStock <= 0 ? 'Out of Stock' : (isLocked ? 'Currently Busy' : 'Book Now'))}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-luxe-gold/50" />
               <h2 className="text-3xl font-bold mb-8 uppercase tracking-tighter">Identity & Delivery <span className="text-luxe-gold">Verification</span></h2>
               <form onSubmit={processPayment} className="space-y-6">
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Delivery Location (City/Address)</label>
                    <input type="text" value={bookingData.deliveryLocation} onChange={(e) => setBookingData({...bookingData, deliveryLocation: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none transition" placeholder="Where should we drop the vehicle?" required />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Driving License Number</label>
                    <input type="text" value={bookingData.licenseNo} onChange={(e) => setBookingData({...bookingData, licenseNo: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none transition uppercase" placeholder="Input DL Number for Verification" required />
                  </div>
                  <div>
                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Contact Phone Number</label>
                    <input type="tel" value={bookingData.phoneNo} onChange={(e) => setBookingData({...bookingData, phoneNo: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none transition" placeholder="+91 XXXX XXX XXX" required />
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <button type="button" onClick={closeModal} className="w-full py-4 text-gray-500 font-bold uppercase tracking-widest hover:text-white transition">Cancel</button>
                    <button type="submit" className="w-full bg-luxe-gold text-black font-bold py-4 rounded-xl uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-all">Proceed to Payment</button>
                  </div>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fleet;
