import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCars } from '../features/carSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';
import GoogleAd from '../components/GoogleAd';

import { setCredentials } from '../features/authSlice';

const Fleet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cars, isLoading } = useSelector((state) => state.cars);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user && user.token) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      axios.get('/api/users/profile', config)
        .then(({ data }) => {
          dispatch(setCredentials(data));
        })
        .catch(err => console.error("Profile sync failed", err));
    }
  }, [dispatch, user?.token]);

  const [selectedCar, setSelectedCar] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);
  const [bookingData, setBookingData] = useState({
    deliveryLocation: '', licenseNo: '', phoneNo: ''
  });

  const now = new Date();
  const getTodayStr = (d = now) => d.toISOString().split('T')[0];
  const getTimeStr = (d = now) => d.toTimeString().slice(0, 5);

  const [bookingType, setBookingType] = useState('1day');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [startTime, setStartTime] = useState(getTimeStr());
  const [endDate, setEndDate] = useState(getTodayStr(new Date(now.getTime() + 24 * 60 * 60 * 1000)));
  const [endTime, setEndTime] = useState(getTimeStr());

  const [lockedCars, setLockedCars] = useState({}); 
  const [socket, setSocket] = useState(null);
  const [myId, setMyId] = useState(null);
  const [pendingLockId, setPendingLockId] = useState(null); 
  
  const carsRef = { current: cars };

  useEffect(() => {
    if (bookingType === '1day') {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + 24 * 60 * 60 * 1000);
      setEndDate(endDateTime.toISOString().split('T')[0]);
      setEndTime(endDateTime.toTimeString().slice(0, 5));
    }
  }, [startDate, startTime, bookingType]);

  useEffect(() => {
    dispatch(getCars({ startDate, endDate }));
    
    const newSocket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
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
      dispatch(getCars({ startDate, endDate }));
    });

    newSocket.on('lockGranted', ({ carId }) => {
      setPendingLockId(prev => {
        if (prev === carId) {
          const car = carsRef.current.find(c => c._id === carId);
          if (car) {
            setSelectedCar(car);
            const today = new Date();
            setStartDate(getTodayStr(today));
            setStartTime(getTimeStr(today));
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
  }, [dispatch, user, startDate, endDate]);

  const handleBookingClick = (car) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const kyc = user?.kycDetails;
    const isKycUploaded = kyc && 
                          kyc.licenseFront?.length > 5 && 
                          kyc.licenseBack?.length > 5 && 
                          kyc.idProofFront?.length > 5 && 
                          kyc.idProofBack?.length > 5;

    if (user?.role !== 'admin' && !isKycUploaded) {
      alert("⚠️ Verification required. Please upload documents in your profile.");
      navigate('/profile');
      return;
    }
    
    const currentOccupancy = (lockedCars[car._id] || []).filter(lock => lock.socketId !== myId).length;
    if (currentOccupancy >= car.countInStock) {
      alert("This vehicle is currently being reserved by others. Please wait.");
      return;
    }

    if (!socket || !socket.connected) {
      window.location.reload();
      return;
    }

    setPendingLockId(car._id);
    socket.emit('lockCar', { carId: car._id, userId: user._id });
  };

  const closeModal = () => {
    setShowModal(false);
    if (selectedCar && socket && user) {
      socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    
    if (!bookingData.licenseNo || !bookingData.phoneNo) {
      alert("Please fill in all details.");
      return;
    }

    // Guard against manually blocked dates (countInStock === 1)
    if (selectedCar?.countInStock <= 1 && selectedCar?.blockedDates?.length > 0) {
      const s = new Date(startDate);
      const end_ = new Date(endDate);
      const cur = new Date(s);
      while (cur <= end_) {
        const iso = cur.toISOString().split('T')[0];
        if (selectedCar.blockedDates.includes(iso)) {
          alert(`⚠️ Booking blocked: ${new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} is manually blocked for this vehicle. Please choose different dates.`);
          return;
        }
        cur.setDate(cur.getDate() + 1);
      }
    }

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const pickupLocation = selectedCar.dealerName || "Dealership Pickup";

    try {
      setShowModal(false);
      setPaymentLoadingId(selectedCar._id);

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: order } = await axios.post('/api/bookings/checkout', {
        carId: selectedCar._id,
        pricePerDay: selectedCar.pricePerDay,
        rentalDays
      }, config);

      const options = {
        key: 'rzp_live_SX7dA0kgUoreAg',
        amount: order.amount,
        currency: order.currency,
        name: "LuxeDrive",
        description: `Rental: ${selectedCar.make} ${selectedCar.model}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await axios.post('/api/bookings/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              carId: selectedCar._id,
              pricePerDay: selectedCar.pricePerDay,
              rentalDays,
              deliveryLocation: pickupLocation,
              licenseNo: bookingData.licenseNo,
              phoneNo: bookingData.phoneNo,
              startDate: `${startDate} ${startTime}`,
              endDate: `${endDate} ${endTime}`
            }, config);

            socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
            navigate('/my-bookings'); 
          } catch (err) {
            alert("Payment verification failed.");
            socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
          }
        },
        modal: {
          ondismiss: () => {
            socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
            setPaymentLoadingId(null);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#C5A059" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentLoadingId(null);

    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'Transaction failed.'}`);
      setPaymentLoadingId(null);
      socket.emit('unlockCar', { carId: selectedCar._id, userId: user._id });
    }
  };

  return (
    <div className="min-h-screen bg-luxe-dark pb-20 overflow-x-hidden">
      {/* Page Header */}
      <section className="relative pt-44 pb-32 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 blur-3xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-luxe-gold/20 rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 md:mb-8"
          >
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-luxe-gold font-bold">Curated Excellence</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-8xl font-serif mb-6 md:mb-8"
          >
            The <span className="text-gradient">Elite</span> Fleet
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-base md:text-xl font-light max-w-2xl mx-auto px-4"
          >
            Experience unparalleled luxury with our world-class collection of performance and prestige vehicles.
          </motion.p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mb-16 md:mb-24 relative z-20">
        <div className="glass-card p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 w-full">
            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/50 font-bold ml-1">Arrival Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white hover:border-luxe-gold/30 focus:border-luxe-gold outline-none transition text-sm"
              />
            </div>
            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/50 font-bold ml-1">Return Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white hover:border-luxe-gold/30 focus:border-luxe-gold outline-none transition text-sm"
              />
            </div>
          </div>
          <button 
            onClick={() => dispatch(getCars({ startDate, endDate }))}
            className="w-full md:w-auto px-10 md:px-12 py-4 md:py-5 bg-white text-black font-bold uppercase text-[10px] tracking-[0.2em] md:tracking-[0.3em] rounded-xl hover:bg-luxe-gold transition-colors whitespace-nowrap"
          >
            Apply Dates
          </button>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-12 h-12 border-t-2 border-luxe-gold rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-500 font-bold">Synchronizing Inventory</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {cars.map((car, index) => {
              const activeUserLocks = (lockedCars[car._id] || []).filter(lock => lock.socketId !== myId);
              const isLocked = activeUserLocks.length >= car.countInStock;
              const isUnavailable = car.isAvailableForDates === false;

              return (
                <motion.div
                  key={car._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: (index % 2) * 0.1 }}
                  className="group relative bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col md:flex-row h-auto md:h-[350px]"
                >
                  {/* Image Part */}
                  <div className="md:w-1/2 h-64 md:h-full overflow-hidden relative">
                    <img 
                      src={car.images[0]} 
                      alt={car.model} 
                      className="w-full h-full object-cover transform scale-[1.05] group-hover:scale-100 transition-transform duration-[1.5s] ease-out opacity-80 group-hover:opacity-100" 
                    />
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-luxe-gold border border-luxe-gold/20">
                        {car.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Part */}
                  <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="font-serif">
                          <h3 className="text-2xl md:text-3xl text-white mb-1">{car.make}</h3>
                          <p className="text-luxe-gold text-lg md:text-xl italic">{car.model}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-luxe-gold" />
                          <span>{car.year} Model</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${isUnavailable ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span>{isUnavailable ? 'Reserved' : 'Available'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                      <div className="flex items-baseline justify-between border-b border-white/5 pb-3 md:pb-4">
                        <span className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-gray-500">Rate / Day</span>
                        <div className="text-right">
                          <span className="text-xl md:text-2xl font-serif text-white">₹{car.pricePerDay.toLocaleString()}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookingClick(car)}
                        disabled={isUnavailable || isLocked || paymentLoadingId === car._id || car.countInStock <= 0 || pendingLockId === car._id}
                        className={`w-full py-4 relative overflow-hidden transition-all duration-500 group/btn ${
                          (isUnavailable || isLocked || car.countInStock <= 0)
                          ? 'opacity-40 grayscale cursor-not-allowed'
                          : ''
                        }`}
                      >
                        <div className="absolute inset-0 bg-white group-hover/btn:bg-luxe-gold transition-colors duration-500" />
                        <span className="relative z-10 text-black text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em]">
                          {isUnavailable ? 'Reserved' : (pendingLockId === car._id ? 'Securing...' : 'Reserve Now')}
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* Modal Flow */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={closeModal} 
              className="absolute inset-0 bg-black/95 backdrop-blur-md" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-luxe-dark-soft border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] flex flex-col md:flex-row shadow-2xl"
            >
              {/* Left Side: Summary */}
              <div className="md:w-2/5 p-8 md:p-12 bg-[#080808] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between">
                <div>
                  <div className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-luxe-gold font-bold mb-4 md:mb-6">Reservation Summary</div>
                  <h2 className="text-3xl md:text-4xl font-serif text-white mb-1 md:mb-2">{selectedCar.make}</h2>
                  <p className="text-luxe-gold text-xl md:text-2xl font-serif italic mb-6 md:mb-8">{selectedCar.model}</p>
                  
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold">Pick-up Location</span>
                      <span className="text-xs md:text-sm text-white/90 font-light">{selectedCar.dealerName || 'LuxeDrive Elite Center'}</span>
                    </div>
                    <div className="h-24 md:h-32 rounded-xl overflow-hidden border border-white/5 opacity-60">
                      <iframe width="100%" height="100%" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.7)' }} loading="lazy" src={`https://maps.google.com/maps?q=${selectedCar.location.coordinates[1]},${selectedCar.location.coordinates[0]}&z=15&output=embed`}></iframe>
                    </div>
                  </div>
                </div>

                <div className="pt-6 md:pt-8 border-t border-white/5 mt-6 md:mt-0">
                  <div className="flex justify-between items-baseline mb-1 md:mb-2">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 font-bold">Base Rate</span>
                    <span className="text-lg md:text-xl font-serif text-white">₹{selectedCar.pricePerDay.toLocaleString()}</span>
                  </div>
                  <p className="text-[8px] md:text-[9px] text-gray-600 font-bold tracking-widest uppercase italic">Includes premium insurance & concierge</p>
                </div>
              </div>

              {/* Right Side: Form */}
              <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                {/* ── Blocked-date conflict detection ─────────────────────────────── */}
                {(() => {
                  // Build a Set of every date in the user's chosen range
                  const blockedDates = selectedCar?.blockedDates || [];
                  const stock = selectedCar?.countInStock ?? 1;
                  let conflictDates = [];

                  if (stock <= 1 && blockedDates.length > 0 && startDate && endDate) {
                    const s = new Date(startDate);
                    const e = new Date(endDate);
                    const cur = new Date(s);
                    while (cur <= e) {
                      const iso = cur.toISOString().split('T')[0];
                      if (blockedDates.includes(iso)) conflictDates.push(iso);
                      cur.setDate(cur.getDate() + 1);
                    }
                  }

                  // Expose to outer scope via a data attr we read in submit
                  window.__luxeConflict__ = conflictDates.length > 0;

                  return conflictDates.length > 0 ? (
                    <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl p-4 mb-2">
                      <span className="text-red-400 text-lg leading-none mt-0.5">⚠</span>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 mb-1">Date Conflict Detected</p>
                        <p className="text-[8px] md:text-[9px] text-red-400/70 leading-relaxed">
                          This vehicle is manually blocked on <span className="font-bold text-red-400">{conflictDates.map(d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })).join(', ')}</span>. Please choose different dates.
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}

                <form onSubmit={processPayment} className="space-y-8 md:space-y-10">
                  <div className="space-y-6 md:space-y-8">
                    <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/80 border-b border-white/5 pb-3">Configuration</h3>
                    
                    <div className="flex gap-3 md:gap-4">
                      {['1day', 'custom'].map(type => (
                        <button 
                          key={type}
                          type="button" 
                          onClick={() => setBookingType(type)}
                          className={`flex-1 py-3 md:py-4 rounded-xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all border ${bookingType === type ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'}`}
                        >
                          {type === '1day' ? 'Standard (24h)' : 'Custom Period'}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">Arrival Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white hover:border-white/30 outline-none transition text-xs md:text-sm" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">Arrival Time</label>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white hover:border-white/30 outline-none transition text-xs md:text-sm" required />
                      </div>
                    </div>

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 transition-opacity duration-500 ${bookingType === '1day' ? 'opacity-30 pointer-events-none' : ''}`}>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">Return Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white outline-none transition text-xs md:text-sm" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">Return Time</label>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white outline-none transition text-xs md:text-sm" required />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 md:space-y-8">
                    <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-white/80 border-b border-white/5 pb-3">Verification</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">Permit Number</label>
                        <input type="text" value={bookingData.licenseNo} onChange={(e) => setBookingData({...bookingData, licenseNo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white hover:border-white/30 outline-none transition text-xs md:text-sm uppercase" placeholder="Verified License" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] md:text-[9px] uppercase tracking-widest text-gray-500 font-bold ml-1">Emergency Handle</label>
                        <input type="tel" value={bookingData.phoneNo} onChange={(e) => setBookingData({...bookingData, phoneNo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 text-white hover:border-white/30 outline-none transition text-xs md:text-sm" placeholder="+91 XXXX XXX XXX" required />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 md:pt-10 flex flex-col sm:flex-row gap-4 md:gap-6">
                    <button type="button" onClick={closeModal} className="w-full sm:flex-1 py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors order-last sm:order-first">Discard</button>
                    <button 
                      type="submit"
                      disabled={window.__luxeConflict__ === true}
                      className={`w-full sm:flex-[2] font-bold py-4 md:py-5 rounded-2xl uppercase tracking-[0.3em] md:tracking-[0.4em] text-[9px] md:text-[10px] shadow-2xl transition-all ${
                        window.__luxeConflict__
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-60'
                          : 'bg-luxe-gold text-black hover:scale-[1.02]'
                      }`}
                    >
                      {window.__luxeConflict__ ? 'Dates Unavailable' : 'Authenticate & Pay'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fleet;
