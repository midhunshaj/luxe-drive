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
