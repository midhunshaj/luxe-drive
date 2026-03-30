# LuxeDrive Booking Feature Server Files

To deploy this directly to your Linux server, just copy and paste the contents into the respective files.

## 1. `backend/controllers/bookingController.js`
Replace the entire contents of `backend/controllers/bookingController.js`:

```javascript
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// 🚀 CRITICAL FIX: Trim whitespace off the .env secrets to completely prevent Linux copy-paste HTTP 401 Unauthorized errors!
const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || 'dummy_id').trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim(),
});

// @desc    Generate a Razorpay Order 
const createCheckoutSession = async (req, res) => {
  try {
    const { carId, pricePerDay } = req.body;
    const rentalDays = 1;
    const totalPaiseAmount = (pricePerDay * 100) * rentalDays;

    const options = {
      amount: totalPaiseAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`, 
    };

    console.log("🟢 API SECURE GATEWAY: Hitting Razorpay servers with key: " + razorpay.key_id);
    const order = await razorpay.orders.create(options);
    console.log("🟢 200 SUCCESS API GATEWAY: Order created ID: ", order.id);

    if (!order) return res.status(500).send("Razorpay Network Error");

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + rentalDays * 24 * 60 * 60 * 1000);

    // Save the pending booking to the database
    await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: startDate,
      endDate: endDate,
      totalCost: pricePerDay * rentalDays,
      paymentStatus: 'pending',
      razorpayOrderId: order.id,
      status: 'active'
    });

    res.json(order);

  } catch (error) {
    console.error("🚨🚨🚨 FATAL NODEJS RAZORPAY FAILURE 🚨🚨🚨");
    console.error("Exact Reason: ", error);
    res.status(500).json({ message: 'Razorpay Gateway Blocked Request', error: error });
  }
};

// @desc    Verify the encrypted Razorpay Transaction Signature
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim())
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id }
      );
      res.status(200).json({ message: "Payment verified successfully", success: true });
    } else {
      res.status(400).json({ message: "Invalid signature", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// @desc    Get user's own bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('car').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// @desc    Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email').populate('car').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment, getMyBookings, getAllBookings };
```

---

## 2. `backend/routes/bookingRoutes.js`
Replace the entire contents of `backend/routes/bookingRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyPayment, getMyBookings, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/checkout', protect, createCheckoutSession);
router.post('/verify', protect, verifyPayment);
router.get('/mybookings', protect, getMyBookings);
router.get('/', protect, admin, getAllBookings);

module.exports = router;
```

---

## 3. `frontend/src/pages/MyBookings.jsx`
Create a new file `frontend/src/pages/MyBookings.jsx` and paste this code:

```javascript
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
                    src={booking.car.images && booking.car.images.length > 0 ? booking.car.images[0] : 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&q=80'}
                    alt="Car"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />
                  <div className={`absolute top-4 right-4 backdrop-blur px-3 py-1 rounded text-xs font-bold border ${booking.paymentStatus === 'paid' ? 'bg-green-900/80 text-green-400 border-green-500' : 'bg-red-900/80 text-red-400 border-red-500'}`}>
                    {booking.paymentStatus.toUpperCase()}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold tracking-wide mb-1">{booking.car.make} <span className="text-luxe-gold">{booking.car.model}</span></h3>
                    <p className="text-gray-400 text-xs tracking-widest uppercase mb-4">{booking.car.category}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Total Paid:</span>
                        <span className="text-luxe-gold font-semibold">₹ {booking.totalCost.toLocaleString('en-IN')}</span>
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
```

---

## 4. `frontend/src/pages/AdminDashboard.jsx`
Replace the entire contents of `frontend/src/pages/AdminDashboard.jsx`:

```javascript
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCar, reset } from '../features/carSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('deploy'); // 'deploy' | 'bookings'
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', category: '', pricePerDay: '', imageUrl: '', longitude: '77.2090', latitude: '28.6139'
  });

  const { make, model, year, category, pricePerDay, imageUrl, longitude, latitude } = formData;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { isLoading, isError, isSuccess, message } = useSelector((state) => state.cars);

  useEffect(() => {
    // 1. Enterprise Security: Evict users who are NOT Admins immediately
    if (!user || user.role !== 'admin') {
      alert("Unauthorized Access: Only Administrators can enter the Operations Control Panel.");
      navigate('/');
    }

    if (isError) { alert("Upload Failed: " + message); }
    if (isSuccess) {
      alert("Vehicle Successfully Deployed to Global Fleet Database! ✅");
      setFormData({ make: '', model: '', year: '', category: '', pricePerDay: '', imageUrl: '', longitude: '77.2090', latitude: '28.6139' });
    }
    dispatch(reset());
  }, [user, navigate, isSuccess, isError, message, dispatch]);

  useEffect(() => {
    if (activeTab === 'bookings' && user && user.role === 'admin') {
      const fetchBookings = async () => {
        setLoadingBookings(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('/api/bookings', config);
          setBookings(data);
        } catch (error) {
          console.error("Failed to load global bookings", error);
        }
        setLoadingBookings(false);
      };
      fetchBookings();
    }
  }, [activeTab, user]);

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Reconstruct data to precisely match our robust MongoDB Mongoose Configuration
    const carPack = {
      make, model, year: Number(year), category, pricePerDay: Number(pricePerDay),
      images: [imageUrl],
      location: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] } // Geocoded Map Integration Payload!
    };
    dispatch(createCar(carPack));
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => setActiveTab('deploy')}
            className={`px-8 py-3 rounded text-sm tracking-widest uppercase font-bold transition-all ${activeTab === 'deploy' ? 'bg-luxe-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Deploy Vehicle
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-8 py-3 rounded text-sm tracking-widest uppercase font-bold transition-all ${activeTab === 'bookings' ? 'bg-luxe-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Global Bookings
          </button>
        </div>

        {activeTab === 'deploy' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto bg-gray-900 border border-luxe-gold/20 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-center mb-8 border-b border-gray-800 pb-4">
              <span className="text-luxe-gold">Admin</span> Operations Panel
            </h2>

            <h3 className="text-xl font-medium tracking-wide mb-6">Deploy New Vehicle to Global Inventory</h3>
            
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Automaker Make</label>
                 <input type="text" name="make" value={make} onChange={onChange} className="w-full bg-gray-800 border filter-none border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-luxe-gold" placeholder="e.g. Porsche" required />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Vehicle Model</label>
                 <input type="text" name="model" value={model} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-white" placeholder="e.g. 911 GT3 RS" required />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Year</label>
                 <input type="number" name="year" value={year} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-white" placeholder="2024" required />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Category Segment</label>
                 <select name="category" value={category} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-white" required>
                   <option value="" disabled>Select Segment</option>
                   <option value="Supercar">Supercar</option>
                   <option value="Luxury SUV">Luxury SUV</option>
                   <option value="Luxury Sedan">Luxury Sedan</option>
                 </select>
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Daily Rate (INR)</label>
                 <input type="number" name="pricePerDay" value={pricePerDay} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-luxe-gold font-bold" placeholder="e.g. 250000" required />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">High-Res Gallery Image URL</label>
                 <input type="text" name="imageUrl" value={imageUrl} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-white" placeholder="https://unsplash..." required />
              </div>
              
              <div className="md:col-span-2 pt-4 border-t border-gray-800">
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-4 text-center">Precise Geo-Spatial Coordinates (Map feature)</label>
                 <div className="flex gap-4">
                   <input type="text" name="longitude" value={longitude} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-luxe-gold" placeholder="Longitude" required />
                   <input type="text" name="latitude" value={latitude} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-luxe-gold" placeholder="Latitude" required />
                 </div>
              </div>

              <div className="md:col-span-2 mt-6">
                 <button type="submit" disabled={isLoading} className="w-full bg-luxe-gold text-black font-bold py-4 rounded uppercase tracking-wider hover:bg-yellow-500 shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                   {isLoading ? 'Encrypting & Injecting into MongoDB...' : 'Upload Vehicle to Global Fleet'}
                 </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-x-auto">
             <h2 className="text-3xl font-bold uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">
              <span className="text-luxe-gold">Global</span> Reservations Database
            </h2>
            
            {loadingBookings ? (
              <div className="text-center text-luxe-gold mb-8 text-xl font-bold animate-pulse">Decrypting Ledger...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 text-lg">No global reservations found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
                    <th className="py-4 px-4">User</th>
                    <th className="py-4 px-4">Vehicle</th>
                    <th className="py-4 px-4">Dates</th>
                    <th className="py-4 px-4">Cost (INR)</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4">Order ID</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {bookings.map((b) => (
                    <tr key={b._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold">{b.user?.name || 'Unknown'}</div>
                        <div className="text-gray-500 text-xs">{b.user?.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-luxe-gold font-bold">{b.car?.make} {b.car?.model}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-400">
                        {new Date(b.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 font-bold">
                        ₹{b.totalCost.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${b.paymentStatus === 'paid' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-gray-500 truncate max-w-[120px]" title={b.razorpayOrderId}>
                        {b.razorpayOrderId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
```

---

## 5. `frontend/src/App.jsx`
Replace the entire contents of `frontend/src/App.jsx`:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Fleet from './pages/Fleet';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans selection:bg-luxe-gold selection:text-black">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="*" element={<div className="p-40 text-center text-4xl text-gray-500">Page Coming Soon!</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

---

## 6. `frontend/src/components/Navbar.jsx`
Replace the entire contents of `frontend/src/components/Navbar.jsx`:

```javascript
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Live session-tracking! The Navbar physically transforms based on who logged in
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout()); // Flushes the encrypted JWT completely out of browser storage
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-luxe-dark/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="text-2xl font-bold tracking-widest text-white">
            LUXE<span className="text-luxe-gold">DRIVE</span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8 items-center">
              <Link to="/fleet" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">Our Fleet</Link>
              
              {user ? (
                <>
                  {/* Highly-Guarded Admin Route Visibility */}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-sm font-black uppercase tracking-widest text-luxe-gold hover:text-white transition-colors duration-300">
                      ♦ Admin Panel
                    </Link>
                  )}
                  <Link to="/my-bookings" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">
                    My Bookings
                  </Link>
                  <button onClick={onLogout} className="px-6 py-2 rounded text-gray-300 hover:text-red-500 text-sm tracking-widest uppercase font-semibold transition-colors duration-300">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-6 py-2 rounded border border-luxe-gold text-luxe-gold hover:bg-luxe-gold hover:text-black font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 7. `frontend/src/pages/Fleet.jsx`
Replace the entire contents of `frontend/src/pages/Fleet.jsx`:

```javascript
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
```
