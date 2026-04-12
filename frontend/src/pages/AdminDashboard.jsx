import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCar, reset, getCars } from '../features/carSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('deploy'); // 'deploy' | 'bookings' | 'fleet'
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editCarId, setEditCarId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', category: '', pricePerDay: '', countInStock: 1, dealerName: 'LuxeDrive Premium', imageUrl: '', longitude: '77.2090', latitude: '28.6139'
  });

  const { make, model, year, category, pricePerDay, countInStock, dealerName, imageUrl, longitude, latitude } = formData;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { cars, isLoading, isError, isSuccess, message } = useSelector((state) => state.cars);

  useEffect(() => {
    // 1. Enterprise Security: Evict users who are NOT Admins immediately
    if (!user || !['admin', 'provider'].includes(user.role)) {
      alert("Unauthorized Access: Only Administrators and Providers can enter the Operations Control Panel.");
      navigate('/');
    } else if (user.role === 'provider' && user.providerStatus !== 'approved') {
      alert("Account Pending: Your business profile is currently awaiting verification from an Administrator.");
      navigate('/fleet');
    }
    dispatch(reset());
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (activeTab === 'bookings' && user && ['admin', 'provider'].includes(user.role)) {
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
    if (activeTab === 'providers' && user && user.role === 'admin') {
      const fetchProviders = async () => {
        setLoadingProviders(true);
        try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get('/api/users/providers', config);
          setProviders(data);
        } catch (error) {
          console.error("Failed to load providers", error);
        }
        setLoadingProviders(false);
      };
      fetchProviders();
    }
    if (activeTab === 'fleet' && user && ['admin', 'provider'].includes(user.role)) {
      dispatch(getCars());
    }
  }, [activeTab, user, dispatch]);

  const updateDealerStatus = async (bookingId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/bookings/${bookingId}/status`, { dealerStatus: status }, config);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, dealerStatus: status } : b));
      setSuccessMsg(`Booking ${status} successfully! ✅`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      console.error(error);
      const backendError = error.response?.data?.message || error.message || "Unknown error";
      alert(`Failed to update status: ${backendError}`);
  };

  const updateProviderStatus = async (providerId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/providers/${providerId}/status`, { status }, config);
      setProviders(providers.map(p => p._id === providerId ? { ...p, providerStatus: status } : p));
      setSuccessMsg(`Provider ${status} successfully! ✅`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert("Failed to update provider status");
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploadingImage(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      setFormData((prev) => ({ ...prev, imageUrl: data }));
      setUploadingImage(false);
    } catch (error) {
      console.error(error);
      setUploadingImage(false);
      const backendError = error.response?.data?.message || error.message || "Unknown Express server error";
      alert(`Image upload failed: ${backendError}`);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this vehicle?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/cars/${id}`, config);
        dispatch(getCars());
        alert("Vehicle deleted safely.");
      } catch (err) {
        alert("Failed to delete vehicle");
      }
    }
  };

  const editHandler = (car) => {
    setEditCarId(car._id);
    setFormData({
      make: car.make, model: car.model, year: car.year, category: car.category, pricePerDay: car.pricePerDay, 
      countInStock: car.countInStock || 1, dealerName: car.dealerName || 'LuxeDrive Premium',
      imageUrl: car.images[0] || '', longitude: car.location?.coordinates[0] || '77.2090', latitude: car.location?.coordinates[1] || '28.6139'
    });
    setActiveTab('deploy');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl) return alert("Please upload an image first!");

    const carPack = {
      make, model, year: Number(year), category, pricePerDay: Number(pricePerDay),
      countInStock: Number(countInStock), dealerName,
      images: [imageUrl],
      location: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] }
    };

    if (editCarId) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/cars/${editCarId}`, carPack, config);
        setSuccessMsg("Vehicle updated successfully! ✅");
        setTimeout(() => setSuccessMsg(''), 4000);
        setEditCarId(null);
        setFormData({ make: '', model: '', year: '', category: '', pricePerDay: '', countInStock: 1, dealerName: 'LuxeDrive Premium', imageUrl: '', longitude: '77.2090', latitude: '28.6139' });
        dispatch(getCars());
        setActiveTab('fleet');
      } catch(err) {
        alert("Failed to update vehicle");
      }
    } else {
      dispatch(createCar(carPack))
        .unwrap()
        .then(() => {
          setSuccessMsg("Vehicle Successfully Deployed to Global Fleet! ✅");
          setTimeout(() => setSuccessMsg(''), 4000);
          setFormData({ make: '', model: '', year: '', category: '', pricePerDay: '', countInStock: 1, dealerName: 'LuxeDrive Premium', imageUrl: '', longitude: '77.2090', latitude: '28.6139' });
        })
        .catch((err) => {
          alert(`Upload Failed: ${err}`);
        });
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex justify-center space-x-4 mb-8">
          <button 
            onClick={() => { setActiveTab('deploy'); setEditCarId(null); setFormData({ make: '', model: '', year: '', category: '', pricePerDay: '', countInStock: 1, dealerName: user?.role === 'provider' ? user.companyName : 'LuxeDrive Premium', imageUrl: '', longitude: '77.2090', latitude: '28.6139' }); }}
            className={`px-8 py-3 rounded text-sm tracking-widest uppercase font-bold transition-all ${activeTab === 'deploy' ? 'bg-luxe-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {editCarId ? 'Update Vehicle' : 'Deploy Vehicle'}
          </button>
          <button 
            onClick={() => setActiveTab('fleet')}
            className={`px-8 py-3 rounded text-sm tracking-widest uppercase font-bold transition-all ${activeTab === 'fleet' ? 'bg-luxe-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Manage Fleet
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`px-8 py-3 rounded text-sm tracking-widest uppercase font-bold transition-all ${activeTab === 'bookings' ? 'bg-luxe-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            Global Bookings
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setActiveTab('providers')}
              className={`px-8 py-3 rounded text-sm tracking-widest uppercase font-bold transition-all ${activeTab === 'providers' ? 'bg-luxe-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              Providers
            </button>
          )}
        </div>

        {activeTab === 'deploy' ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto bg-gray-900 border border-luxe-gold/20 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-center mb-8 border-b border-gray-800 pb-4">
              <span className="text-luxe-gold">{user?.role === 'admin' ? 'Admin' : 'Provider'}</span> Operations Panel
            </h2>

            <h3 className="text-xl font-medium tracking-wide mb-6">{editCarId ? 'Update Existing Vehicle' : 'Deploy New Vehicle to Global Inventory'}</h3>
            
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
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Inventory Quantity (Available)</label>
                 <input type="number" name="countInStock" value={countInStock} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold text-white" placeholder="1" required />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">Rental Provider / Company Name</label>
                 <input type="text" name="dealerName" value={dealerName} onChange={onChange} className={`w-full bg-gray-800 border ${user?.role === 'provider' ? 'border-gray-900 text-gray-500 cursor-not-allowed' : 'border-gray-700 text-white'} rounded p-3 focus:outline-none focus:border-luxe-gold`} placeholder="e.g. Sixt, Zoomcar, LuxeDrive" required readOnly={user?.role === 'provider'} />
              </div>
              <div>
                 <label className="block text-gray-400 text-xs tracking-widest uppercase mb-2">High-Res Gallery Image {uploadingImage && <span className="text-luxe-gold">(Uploading...)</span>}</label>
                 <input type="file" accept="image/*" onChange={uploadFileHandler} className="w-full bg-gray-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-luxe-gold text-white" />
                 {imageUrl && <div className="mt-2 text-xs text-green-400 break-all">✅ Logged: {imageUrl}</div>}
              </div>
              
              <div className="md:col-span-2 pt-4 border-t border-gray-800">
                 <div className="flex justify-between items-center mb-4">
                   <label className="block text-gray-400 text-xs tracking-widest uppercase">Precise Dealership Geo-Location</label>
                   <button type="button" onClick={() => {
                     if (navigator.geolocation) {
                       navigator.geolocation.getCurrentPosition(
                         (pos) => setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })),
                         () => alert("GPS Permission denied by browser.")
                       );
                     }
                   }} className="text-xs bg-gray-800 text-luxe-gold px-3 py-1 rounded border border-luxe-gold/30 hover:bg-luxe-gold hover:text-black transition">
                     📡 Auto-Detect My Location
                   </button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-4">
                     <input type="text" name="latitude" value={latitude} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-luxe-gold text-white" placeholder="Latitude (e.g. 28.6139)" required />
                     <input type="text" name="longitude" value={longitude} onChange={onChange} className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-center focus:border-luxe-gold text-white" placeholder="Longitude (e.g. 77.2090)" required />
                   </div>
                   
                   <div className="rounded overflow-hidden border border-gray-700 h-32 w-full">
                     {/* 100% Free Google Maps Embed Visualizer */}
                     <iframe 
                       width="100%" 
                       height="100%" 
                       style={{ border: 0 }} 
                       loading="lazy" 
                       src={`https://maps.google.com/maps?q=${latitude || 0},${longitude || 0}&z=15&output=embed`}
                     ></iframe>
                   </div>
                 </div>
              </div>

              <div className="md:col-span-2 mt-6">
                 {successMsg && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-900/50 border border-green-500 text-green-400 p-4 rounded mb-6 text-center font-bold tracking-widest uppercase">
                     {successMsg}
                   </motion.div>
                 )}
                 <button type="submit" disabled={isLoading || uploadingImage} className="w-full bg-luxe-gold text-black font-bold py-4 rounded uppercase tracking-wider hover:bg-yellow-500 shadow-[0_0_20px_rgba(212,175,55,0.4)] disabled:opacity-50 transition-all">
                   {isLoading ? 'Encrypting & Injecting into MongoDB...' : editCarId ? 'Update Vehicle Details' : 'Upload Vehicle to Global Fleet'}
                 </button>
              </div>
            </form>
          </motion.div>
        ) : activeTab === 'fleet' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-x-auto">
             <h2 className="text-3xl font-bold uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">
              <span className="text-luxe-gold">Active</span> Vehicle Inventory
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
                  <th className="py-4 px-4">Img</th>
                  <th className="py-4 px-4">Make / Model</th>
                  <th className="py-4 px-4">Provider</th>
                  <th className="py-4 px-4">Segment</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4">Rate (INR)</th>
                  <th className="py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {(user?.role === 'admin' ? cars : cars.filter(c => c.dealerName === user?.companyName)).map((car) => (
                  <tr key={car._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-2 px-4"><img src={car.images[0]} alt="car" className="w-12 h-12 object-cover rounded shadow" /></td>
                    <td className="py-2 px-4 font-bold">{car.make} <span className="text-luxe-gold">{car.model}</span> ({car.year})</td>
                    <td className="py-2 px-4 text-xs font-bold text-gray-400">{car.dealerName || 'LuxeDrive'}</td>
                    <td className="py-2 px-4 text-gray-400">{car.category}</td>
                    <td className="py-2 px-4 italic font-bold text-gray-300">{car.countInStock || 0} In Stock</td>
                    <td className="py-2 px-4 font-mono font-bold text-luxe-gold">₹{car.pricePerDay.toLocaleString()}</td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => editHandler(car)} className="px-3 py-1 bg-yellow-900 hover:bg-yellow-800 text-yellow-100 rounded text-xs font-bold uppercase transition">Edit</button>
                        <button onClick={() => deleteHandler(car._id)} className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded text-xs font-bold uppercase transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-x-auto">
             <h2 className="text-3xl font-bold uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">
              <span className="text-luxe-gold">{user?.role === 'admin' ? 'Global' : 'Your'}</span> Reservations Database
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
                    <th className="py-4 px-4">Location/Phone</th>
                    <th className="py-4 px-4">Payment</th>
                    <th className="py-4 px-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {(user?.role === 'admin' ? bookings : bookings.filter(b => b.car?.dealerName === user?.companyName)).map((b) => (
                    <tr key={b._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold">{b.user?.name || 'Unknown'}</div>
                        <div className="text-gray-500 text-xs">{b.user?.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-luxe-gold font-bold">{b.car?.make} {b.car?.model}</div>
                        <div className="text-[10px] text-gray-500">{b._id}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-xs">
                        {new Date(b.startDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div>
                          📍 {b.deliveryLocation?.startsWith('http') ? (
                            <a href={b.deliveryLocation} target="_blank" rel="noreferrer" className="text-luxe-gold hover:underline">View Map Link</a>
                          ) : (
                            b.deliveryLocation || '<none>'
                          )}
                        </div>
                        <div className="text-gray-500 pt-1">📞 {b.phoneNo || '<none>'}</div>
                        <div className="text-gray-500">💳 {b.licenseNo || '<none>'}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`px-2 py-1 rounded text-center text-xs font-bold uppercase mb-1 ${b.paymentStatus === 'paid' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                          {b.paymentStatus}
                        </div>
                        <div className="text-xs text-center font-mono">₹{b.totalCost?.toLocaleString('en-IN')}</div>
                      </td>
                      <td className="py-4 px-4">
                        {b.dealerStatus === 'pending' || !b.dealerStatus ? (
                          <div className="flex gap-2">
                            <button onClick={() => updateDealerStatus(b._id, 'accepted')} className="px-3 py-1 bg-green-900 hover:bg-green-800 text-green-100 rounded text-xs font-bold uppercase transition">Accept</button>
                            <button onClick={() => updateDealerStatus(b._id, 'rejected')} className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded text-xs font-bold uppercase transition">Reject</button>
                          </div>
                        ) : (
                          <span className={`px-3 py-1 block text-center rounded text-xs font-bold uppercase ${b.dealerStatus === 'accepted' ? 'text-green-400 bg-green-900/30 border border-green-500' : 'text-red-400 bg-red-900/30 border border-red-500'}`}>
                            {b.dealerStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        ) : activeTab === 'providers' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900 border border-gray-800 p-8 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-x-auto">
             <h2 className="text-3xl font-bold uppercase tracking-widest mb-8 border-b border-gray-800 pb-4">
              <span className="text-luxe-gold">Accredited</span> Providers List
            </h2>
            
            {loadingProviders ? (
              <div className="text-center text-luxe-gold mb-8 text-xl font-bold animate-pulse">Fetching Provider Database...</div>
            ) : providers.length === 0 ? (
              <div className="text-center text-gray-500 mt-10 text-lg">No rental providers found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-widest">
                    <th className="py-4 px-4">Provider Identity</th>
                    <th className="py-4 px-4">Brand / Company</th>
                    <th className="py-4 px-4">Current Status</th>
                    <th className="py-4 px-4">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {providers.map((p) => (
                    <tr key={p._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-gray-500 text-[10px]">{p.email}</div>
                      </td>
                      <td className="py-4 px-4 font-bold text-luxe-gold uppercase tracking-widest text-xs">
                        {p.companyName || 'UNKNOWN'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.providerStatus === 'approved' ? 'bg-green-900/30 text-green-400 border border-green-500' : p.providerStatus === 'rejected' ? 'bg-red-900/30 text-red-500 border border-red-500' : 'bg-yellow-900/30 text-yellow-500 border border-yellow-500'}`}>
                          {p.providerStatus}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {p.providerStatus !== 'approved' && (
                            <button onClick={() => updateProviderStatus(p._id, 'approved')} className="px-3 py-1 bg-green-900 hover:bg-green-800 text-green-100 rounded text-xs font-bold uppercase transition">Approve</button>
                          )}
                          {p.providerStatus !== 'rejected' && (
                            <button onClick={() => updateProviderStatus(p._id, 'rejected')} className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-100 rounded text-xs font-bold uppercase transition">Reject</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        ) : null}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
