import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCars } from '../features/carSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';
import GoogleAd from '../components/GoogleAd';

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

  // Real-time Locking State (Maps carId to array of user-locks)
  const [lockedCars, setLockedCars] = useState({}); 
  const [socket, setSocket] = useState(null);
  const [myId, setMyId] = useState(null);
  const [pendingLockId, setPendingLockId] = useState(null); 
  
  // Create a ref for cars to use inside socket listeners without stale closures
  const carsRef = { current: cars };

  useEffect(() => {
    dispatch(getCars());
    
    // --- Initialize Real-time Conflict Prevention ---
    // Using relative connection to work flawlessly behind Nginx over HTTPS/WSS
    const newSocket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log("📡 Connected with Session ID:", newSocket.id);
      setMyId(newSocket.id);
    });

    newSocket.on('initialLocks', (locks) => setLockedCars(locks));
    newSocket.on('carLocked', ({ carId, locks }) => {
      setLockedCars(prev => ({ ...prev, [carId]: locks }));
    });
    newSocket.on('carUnlocked', ({ carId, locks }) => {
      setLockedCars(prev => ({ ...prev, [carId]: locks }));
    });
    newSocket.on('inventoryUpdate', () => {
      dispatch(getCars());
    });

    newSocket.on('lockGranted', ({ carId }) => {
      setPendingLockId(prev => {
        if (prev === carId) {
          const car = carsRef.current.find(c => c._id === carId);
          if (car) {
            setSelectedCar(car);
            setBookingData({ deliveryLocation: '', licenseNo: '', phoneNo: user?.phone || '' });
            setShowModal(true);
          }
        }
        return null;
      });
    });

    newSocket.on('lockRejected', ({ carId, reason }) => {
      setPendingLockId(prev => {
        if (prev === carId) {
          alert(reason);
        }
        return null;
      });
    });

    return () => newSocket.disconnect();
  }, [dispatch, user]);

  const detectMyLocation = () => {
    if (navigator.geolocation) {
      setBookingData(prev => ({ ...prev, deliveryLocation: "📡 Synchronizing GPS..." }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Format as readable coordinates for the user
          setBookingData(prev => ({ ...prev, deliveryLocation: `${latitude.toFixed(4)}, ${longitude.toFixed(4)} (My Current Location)` }));
        },
        () => {
          alert("GPS Permission Denied. Please type your address manually.");
          setBookingData(prev => ({ ...prev, deliveryLocation: "" }));
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleBookingClick = (car) => {
    if (!user) {
      alert("Please Sign In first to reserve an ultra-luxury vehicle.");
      navigate('/login');
      return;
    }

    // --- SECURE KYC GATE (Document Presence Check) ---
    const isKycUploaded = 
      user?.kycDetails?.licenseFront && 
      user?.kycDetails?.licenseBack && 
      user?.kycDetails?.idProofFront && 
      user?.kycDetails?.idProofBack;

    if (user.role === 'user' && !isKycUploaded) {
      alert("Missing Documentation: Please upload your Driving License (Front & Back) and Identity Proof in the Profile section to unlock bookings.");
      navigate('/profile');
      return;
    }
    
    // Check if the car is FULLY occupied by other users
    // Check if the car is FULLY occupied by other sessions
    // Using myId from state to ensure reactivity
    const currentOccupancy = (lockedCars[car._id] || []).filter(lock => lock.socketId !== myId).length;
    if (currentOccupancy >= car.countInStock) {
      alert("All available units of this vehicle are currently being reserved by other clients. Please wait 60 seconds.");
      return;
    }

    // --- CONNECTION HEALTH CHECK ---
    if (!socket || !socket.connected) {
      alert("Live sync interrupted. Reconnecting LuxeDrive Engine...");
      window.location.reload();
      return;
    }

    // BROADCAST: Request Server Authority to lock this unit
    setPendingLockId(car._id);
    socket.emit('lockCar', { carId: car._id, userId: user._id });

    // --- SAFETY TIMEOUT (Phone Stability) ---
    // If server lost signal, force unlock UI after 10 seconds
    setTimeout(() => {
      setPendingLockId(prev => {
        if (prev === car._id) {
          console.warn("Safety Trigger: Lock auth signal lost. Clearing UI state.");
          return null;
        }
        return prev;
      });
    }, 10000);
  };

  const closeModal = () => {
    setShowModal(false);
    if (selectedCar && socket && user) {
      socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
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
        socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
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
               socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
               navigate('/my-bookings'); 
            }
          } catch (err) {
            console.error(err);
            alert("Verification Failed.");
            socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
          }
        },
        modal: {
          ondismiss: function() {
            socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
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
      socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
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
              // A car is ONLY considered "Locked" if all physical units are being occupied by other users/sessions
              const activeUserLocks = (lockedCars[car._id] || []).filter(lock => lock.socketId !== myId);
              const isLocked = activeUserLocks.length >= car.countInStock;
              
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
                             ⚠️ All Units Being Reserved
                          </span>
                       </div>
                    )}
                  </div>
                  
                  <div className="p-8">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-1">{car.make} <span className="text-luxe-gold">{car.model}</span></h3>
                        <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-1">Provider: <span className="text-white">{car.dealerName || 'LuxeDrive Premium'}</span></p>
                        <p className="text-gray-500 text-[10px] font-medium">{car.year} Production Model</p>
                        <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${car.countInStock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          Availability: {car.countInStock || 0} Units Remain
                        </p>
                        {car.countInStock > 0 && activeUserLocks.length > 0 && (
                          <p className="text-[10px] text-yellow-500 mt-1 animate-pulse">⚠️ {activeUserLocks.length} user(s) currently checking out</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-luxe-gold text-2xl font-black">₹{car.pricePerDay.toLocaleString()}</p>
                        <p className="text-gray-600 text-[10px] uppercase tracking-widest">Per Day</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBookingClick(car)}
                      disabled={isLocked || paymentLoadingId === car._id || (car.countInStock <= 0) || pendingLockId === car._id}
                      className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${
                        (isLocked || car.countInStock <= 0 || pendingLockId === car._id)
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700 scale-95'
                          : 'bg-white text-black hover:bg-luxe-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]'
                      }`}
                    >
                      {pendingLockId === car._id ? 'Securing Spot...' : (paymentLoadingId === car._id ? 'Processing...' : (car.countInStock <= 0 ? 'Out of Stock' : (isLocked ? 'Currently Busy' : 'Book Now')))}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Global Discovery Ad Section */}
        <div className="mt-20 border-t border-gray-900 pt-10">
           <p className="text-gray-600 text-[10px] uppercase tracking-widest text-center mb-4 font-bold">Recommended for Elite Explorers</p>
           <GoogleAd slot="REPLACE_WITH_FLEET_PAGE_SLOT_ID" />
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0d0d0d] border border-gray-800 rounded-3xl p-8 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
               <div className="absolute top-0 left-0 w-full h-1 bg-luxe-gold/50" />
               <h2 className="text-3xl font-bold mb-8 uppercase tracking-tighter">Reservation <span className="text-luxe-gold">& Delivery</span></h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block text-gray-400 text-[10px] uppercase tracking-widest mb-2 font-bold flex justify-between">
                       Dealership Origin
                       <a href={`https://www.google.com/maps?q=${selectedCar.location.coordinates[1]},${selectedCar.location.coordinates[0]}`} target="_blank" rel="noreferrer" className="text-luxe-gold hover:underline">📍 View on GMap</a>
                    </label>
                    <div className="rounded-xl overflow-hidden border border-gray-800 h-32 w-full">
                      <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${selectedCar.location.coordinates[1]},${selectedCar.location.coordinates[0]}&z=13&output=embed`}></iframe>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] uppercase tracking-widest mb-2 font-bold">Delivery Preview</label>
                    <div className="rounded-xl overflow-hidden border border-gray-800 h-32 w-full bg-gray-900 border-dashed flex items-center justify-center">
                       {bookingData.deliveryLocation ? (
                         <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${bookingData.deliveryLocation}&z=14&output=embed`}></iframe>
                       ) : (
                         <p className="text-gray-600 text-[10px] uppercase font-bold px-4 text-center">Enter location to visualize delivery route</p>
                       )}
                    </div>
                  </div>
               </div>

               <form onSubmit={processPayment} className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-gray-500 text-xs uppercase tracking-widest font-bold">Delivery Address</label>
                       <button type="button" onClick={detectMyLocation} className="text-[10px] text-luxe-gold bg-luxe-gold/10 px-2 py-1 rounded border border-luxe-gold/30 hover:bg-luxe-gold hover:text-black transition uppercase font-bold tracking-tighter">📡 Detect My Location</button>
                    </div>
                    <input type="text" value={bookingData.deliveryLocation} onChange={(e) => setBookingData({...bookingData, deliveryLocation: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none transition" placeholder="Street, Hotel Name, or Landmarks" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Driving License No.</label>
                      <input type="text" value={bookingData.licenseNo} onChange={(e) => setBookingData({...bookingData, licenseNo: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none transition uppercase" placeholder="Input DL Reference" required />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2 font-bold">Phone No.</label>
                      <input type="tel" value={bookingData.phoneNo} onChange={(e) => setBookingData({...bookingData, phoneNo: e.target.value})} className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none transition" placeholder="+91 XXXX XXX XXX" required />
                    </div>
                  </div>
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <button type="button" onClick={closeModal} className="w-full py-4 text-gray-500 font-bold uppercase tracking-widest hover:text-white transition">Back</button>
                    <button type="submit" className="w-full bg-luxe-gold text-black font-bold py-4 rounded-xl uppercase tracking-widest shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-all text-sm">Review & Pay</button>
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
