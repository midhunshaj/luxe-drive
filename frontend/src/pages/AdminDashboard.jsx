import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCar, reset, getCars } from '../features/carSlice';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('deploy'); // 'deploy' | 'bookings' | 'fleet' | 'providers' | 'kyc'
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editCarId, setEditCarId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [kycRequests, setKycRequests] = useState([]);
  const [loadingKyc, setLoadingKyc] = useState(false);
  const [selectedCarSchedule, setSelectedCarSchedule] = useState(null);
  const [selectedCarBookings, setSelectedCarBookings] = useState(null);
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const openSchedule = (car) => {
    setSelectedCarSchedule(car);
    setCalMonth(new Date().getMonth());
    setCalYear(new Date().getFullYear());
  };

  const toggleAvailability = async (carId, date) => {
    // Optimistic update — flip the date instantly in the UI before API responds
    setSelectedCarSchedule(prev => {
      const blocked = prev.blockedDates || [];
      const isBlocked = blocked.includes(date);
      return {
        ...prev,
        blockedDates: isBlocked ? blocked.filter(d => d !== date) : [...blocked, date]
      };
    });
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/cars/${carId}/availability`, { date }, config);
      setSelectedCarSchedule(data); // Sync with confirmed server state
      dispatch(getCars());
    } catch (err) {
      alert('Failed to toggle date — reverting.');
      // Revert optimistic update on failure
      setSelectedCarSchedule(prev => {
        const blocked = prev.blockedDates || [];
        const isBlocked = blocked.includes(date);
        return {
          ...prev,
          blockedDates: isBlocked ? blocked.filter(d => d !== date) : [...blocked, date]
        };
      });
    }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const getCalendarDays = () => {
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    });
  };

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const { cars, isLoading } = useSelector((state) => state.cars);

  const [formData, setFormData] = useState({
    make: '', model: '', year: '', category: '', pricePerDay: '', countInStock: 1, 
    dealerName: '', imageUrl: '', longitude: '77.2090', latitude: '28.6139'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        dealerName: user.role === 'provider' ? user.companyName : 'LuxeDrive Premium'
      }));
    }
  }, [user]);

  const { make, model, year, category, pricePerDay, countInStock, dealerName, imageUrl, longitude, latitude } = formData;

  useEffect(() => {
    if (!user || !['admin', 'provider'].includes(user.role)) {
      navigate('/');
    }
    dispatch(reset());
  }, [user, navigate, dispatch]);

  useEffect(() => {
    const fetchGlobalData = async () => {
      if (!user) return;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (activeTab === 'bookings' || activeTab === 'fleet') {
        setLoadingBookings(true);
        try {
          const { data } = await axios.get('/api/bookings', config);
          setBookings(data);
        } catch (err) { console.error(err); }
        setLoadingBookings(false);
      }

      if (activeTab === 'providers' && user.role === 'admin') {
        setLoadingProviders(true);
        try {
          const { data } = await axios.get('/api/users/providers', config);
          setProviders(data);
        } catch (err) { console.error(err); }
        setLoadingProviders(false);
      }

      if (activeTab === 'kyc' && user.role === 'admin') {
        setLoadingKyc(true);
        try {
          const { data } = await axios.get('/api/users/kyc-requests', config);
          setKycRequests(data);
        } catch (err) { console.error(err); }
        setLoadingKyc(false);
      }

      if (activeTab === 'fleet') {
        dispatch(getCars());
      }
    };
    
    fetchGlobalData();

    const socket = io({ path: '/socket.io/', transports: ['websocket', 'polling'] });
    socket.on('inventoryUpdate', () => { if (activeTab === 'fleet') dispatch(getCars()); });
    return () => socket.disconnect();
  }, [activeTab, user, dispatch]);

  const updateDealerStatus = async (bookingId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/bookings/${bookingId}/status`, { dealerStatus: status }, config);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, dealerStatus: status } : b));
      setSuccessMsg(`Booking ${status} successfully! ✅`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) { alert("Failed to update status"); }
  };

  const updateProviderStatus = async (providerId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/providers/${providerId}/status`, { status }, config);
      setProviders(providers.map(p => p._id === providerId ? { ...p, providerStatus: status } : p));
      setSuccessMsg(`Provider ${status} successfully! ✅`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) { alert("Failed to update provider status"); }
  };

  const updateKycStatus = async (userId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/${userId}/kyc-status`, { status }, config);
      setKycRequests(prev => prev.map(u => u._id === userId ? { ...u, kycStatus: status } : u));
      setSuccessMsg(`User KYC ${status} successfully! ✅`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) { alert("Failed to update KYC status"); }
  };

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploadingImage(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
      setUploadingImage(false);
    } catch (error) { setUploadingImage(false); alert("Upload Failed"); }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const carPack = {
      make, model, year: Number(year), category, pricePerDay: Number(pricePerDay),
      countInStock: Number(countInStock), dealerName,
      images: [imageUrl],
      location: { type: 'Point', coordinates: [Number(longitude), Number(latitude)] }
    };

    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    if (editCarId) {
      await axios.put(`/api/cars/${editCarId}`, carPack, config);
      setEditCarId(null);
    } else {
      await dispatch(createCar(carPack)).unwrap();
    }
    setSuccessMsg("Success! ✅");
    setTimeout(() => setSuccessMsg(''), 4000);
    dispatch(getCars());
    setActiveTab('fleet');
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Delete vehicle?")) {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/cars/${id}`, config);
      dispatch(getCars());
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-luxe-dark text-white font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['deploy', 'fleet', 'bookings', 'providers', 'kyc'].map(tab => {
            if ((tab === 'providers' || tab === 'kyc') && user?.role !== 'admin') return null;
            return (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full text-[10px] tracking-[0.2em] font-black uppercase transition-all border ${activeTab === tab ? 'bg-luxe-gold text-black border-luxe-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]' : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600'}`}
              >
                {tab === 'deploy' ? (editCarId ? 'Edit Vehicle' : 'Deploy') : tab}
              </button>
            )
          })}
        </div>

        {activeTab === 'deploy' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto bg-gray-900 border border-gray-800 p-10 rounded-3xl shadow-2xl">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b border-gray-800 pb-4">Vehicle <span className="text-luxe-gold">Command Center</span></h2>
            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div>
                   <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Automaker</label>
                   <input name="make" value={make} onChange={onChange} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none" placeholder="Porsche" required />
                 </div>
                 <div>
                   <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Daily Rate (INR)</label>
                   <input type="number" name="pricePerDay" value={pricePerDay} onChange={onChange} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-luxe-gold font-black focus:border-luxe-gold outline-none" placeholder="250000" required />
                 </div>
                 <div>
                   <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Fleet Quantity</label>
                   <input type="number" name="countInStock" value={countInStock} onChange={onChange} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none" required />
                 </div>
               </div>
               <div className="space-y-6">
                 <div>
                   <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Model</label>
                   <input name="model" value={model} onChange={onChange} className="w-full bg-black border border-gray-800 rounded-xl p-4 text-white focus:border-luxe-gold outline-none" placeholder="911 GT3 RS" required />
                 </div>
                 <div>
                   <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Gallery Image</label>
                   <input type="file" onChange={uploadFileHandler} className="w-full bg-black border border-gray-800 rounded-xl p-3 text-xs" />
                   {imageUrl && <p className="text-[10px] text-green-500 mt-2 font-bold uppercase">Image Connected ✅</p>}
                 </div>
                 <div className="pt-4 flex items-center justify-between">
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Year: <input type="number" name="year" value={year} onChange={onChange} className="bg-transparent border-b border-gray-800 w-16 text-white text-center ml-2" placeholder="2025" required /></div>
                   <select name="category" value={category} onChange={onChange} className="bg-black border border-gray-800 rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-luxe-gold outline-none">
                     <option value="">Segment</option>
                     <option value="Supercar">Supercar</option>
                     <option value="Luxury SUV">Luxury SUV</option>
                   </select>
                 </div>
               </div>
               <button type="submit" disabled={uploadingImage} className="md:col-span-2 bg-luxe-gold text-black font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-xs shadow-[0_10px_40px_rgba(212,175,55,0.2)] hover:scale-[1.02] transition-all mt-4">
                 {editCarId ? 'Update Fleet Record' : 'Deploy to Global Inventory'}
               </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'fleet' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 flex justify-between items-center bg-black/40">
              <h2 className="text-xl font-black uppercase tracking-tighter">Fleet <span className="text-luxe-gold">Management</span></h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Authorized Operations Only</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-black border-b border-gray-800">
                    <th className="p-6">Vehicle</th>
                    <th className="p-6">Inventory</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map(car => (
                    <tr key={car._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={car.images[0]} className="w-16 h-10 object-cover rounded-lg border border-gray-800" />
                          <div>
                            <div className="font-bold text-sm">{car.make} <span className="text-luxe-gold">{car.model}</span></div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter italic">{car.dealerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-mono text-xs text-gray-400">{car.countInStock} Units</td>
                      <td className="p-6">
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => openSchedule(car)}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-luxe-gold/30 text-luxe-gold rounded-full hover:bg-luxe-gold hover:text-black transition"
                          >
                            Manage Calendar
                          </button>
                          <button 
                            onClick={() => setSelectedCarBookings(car)}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2 border border-blue-500/30 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition"
                          >
                            Manage Bookings
                          </button>
                        </div>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => { setEditCarId(car._id); setFormData({ ...car, imageUrl: car.images[0], longitude: car.location?.coordinates[0], latitude: car.location?.coordinates[1] }); setActiveTab('deploy'); }} className="text-[10px] font-black uppercase text-blue-400 hover:underline">Edit</button>
                        <button onClick={() => deleteHandler(car._id)} className="text-[10px] font-black uppercase text-red-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
             {bookings.map(b => (
               <div key={b._id} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex flex-wrap items-center justify-between gap-6 hover:border-luxe-gold/30 transition shadow-xl">
                 <div className="flex items-center gap-4">
                   <div className={`w-2 h-2 rounded-full ${b.paymentStatus === 'paid' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                   <div>
                     <div className="text-xs font-black uppercase tracking-tighter text-luxe-gold">{b.car?.make} {b.car?.model}</div>
                     <div className="text-[10px] text-gray-500 font-bold uppercase">Customer: {b.user?.name}</div>
                   </div>
                 </div>
                 <div className="text-center">
                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Duration</div>
                    <div className="text-xs font-bold text-white">{new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}</div>
                 </div>
                 <div className="flex gap-3">
                   {b.dealerStatus === 'pending' && (
                     <>
                        <button onClick={() => updateDealerStatus(b._id, 'accepted')} className="bg-green-600/20 text-green-500 border border-green-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-600 hover:text-white transition">Accept</button>
                        <button onClick={() => updateDealerStatus(b._id, 'rejected')} className="bg-red-600/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition">Reject</button>
                     </>
                   )}
                   {b.dealerStatus !== 'pending' && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-800 px-4 py-2 rounded-xl">{b.dealerStatus}</span>}
                 </div>
               </div>
             ))}
          </div>
        )}

        {activeTab === 'providers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 bg-black/40">
              <h2 className="text-xl font-black uppercase tracking-tighter">Business <span className="text-luxe-gold">Providers</span></h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-black border-b border-gray-800">
                    <th className="p-6">Company / Brand</th>
                    <th className="p-6">Representative</th>
                    <th className="p-6">Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(p => (
                    <tr key={p._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors text-sm">
                      <td className="p-6 font-bold text-luxe-gold">{p.companyName}</td>
                      <td className="p-6">{p.name}<br/><span className="text-[10px] text-gray-500">{p.email}</span></td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${p.providerStatus === 'approved' ? 'bg-green-900/40 text-green-500 border border-green-500/30' : 'bg-yellow-900/40 text-yellow-500 border border-yellow-500/30'}`}>{p.providerStatus}</span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        {p.providerStatus !== 'approved' && <button onClick={() => updateProviderStatus(p._id, 'approved')} className="text-[10px] font-black uppercase text-green-500 border border-green-500/20 px-3 py-1 rounded hover:bg-green-500 hover:text-black">Approve</button>}
                        {p.providerStatus !== 'rejected' && <button onClick={() => updateProviderStatus(p._id, 'rejected')} className="text-[10px] font-black uppercase text-red-500 border border-red-500/20 px-3 py-1 rounded hover:bg-red-500 hover:text-white">Reject</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'kyc' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-800 bg-black/40">
              <h2 className="text-xl font-black uppercase tracking-tighter">KYC <span className="text-luxe-gold">Verification</span> Queue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-black border-b border-gray-800">
                    <th className="p-6">User</th>
                    <th className="p-6">Documents</th>
                    <th className="p-6 text-center">Current Status</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycRequests.map(u => (
                    <tr key={u._id} className="border-b border-gray-800/50 hover:bg-white/5 transition-colors text-sm">
                      <td className="p-6 font-bold">{u.name}</td>
                      <td className="p-6">
                         <div className="flex gap-2">
                            {u.kycDetails?.licenseFront && <a href={u.kycDetails.licenseFront} target="_blank" rel="noreferrer" className="w-12 h-8 rounded border border-gray-800 overflow-hidden"><img src={u.kycDetails.licenseFront} className="w-full h-full object-cover" /></a>}
                         </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.kycStatus === 'approved' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{u.kycStatus}</span>
                      </td>
                      <td className="p-6 text-right space-x-2">
                        <button onClick={() => updateKycStatus(u._id, 'approved')} className="text-[10px] font-black uppercase text-green-500 hover:underline transition">Verify</button>
                        <button onClick={() => updateKycStatus(u._id, 'rejected')} className="text-[10px] font-black uppercase text-red-500 hover:underline transition">Deny</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>

      <AnimatePresence>
        {selectedCarSchedule && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCarSchedule(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Master <span className="text-luxe-gold">Availability</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{selectedCarSchedule.make} {selectedCarSchedule.model} — Stock: {selectedCarSchedule.countInStock}</p>
              </div>

              {/* Month/Year Navigation */}
              <div className="flex items-center justify-between mb-6 bg-white/5 rounded-2xl p-4 border border-gray-800">
                <button onClick={prevMonth} className="text-luxe-gold font-black text-lg hover:scale-110 transition px-2">‹</button>
                <div className="text-center">
                  <p className="text-white font-black text-lg uppercase tracking-tight">{MONTH_NAMES[calMonth]}</p>
                  <p className="text-luxe-gold font-black text-sm">{calYear}</p>
                </div>
                <button onClick={nextMonth} className="text-luxe-gold font-black text-lg hover:scale-110 transition px-2">›</button>
              </div>

              {/* Day Labels */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="text-center text-[10px] text-gray-600 font-black uppercase py-1">{d}</div>)}
              </div>

              {/* Offset for first day of month */}
              <div className="grid grid-cols-7 gap-1 mb-6">
                {Array.from({ length: new Date(calYear, calMonth, 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
                {getCalendarDays().map(date => {
                  const isManualBlocked = selectedCarSchedule.blockedDates?.includes(date);
                  const dateBookings = bookings.filter(b =>
                    b.car?._id === selectedCarSchedule._id &&
                    b.paymentStatus === 'paid' &&
                    b.status !== 'cancelled' &&
                    new Date(date) >= new Date(new Date(b.startDate).toDateString()) &&
                    new Date(date) <= new Date(new Date(b.endDate).toDateString())
                  );
                  const isSysBlocked = dateBookings.length >= selectedCarSchedule.countInStock;
                  const day = parseInt(date.split('-')[2]);
                  return (
                    <button
                      key={date}
                      disabled={isSysBlocked}
                      onClick={() => toggleAvailability(selectedCarSchedule._id, date)}
                      title={isSysBlocked ? `Booked by ${dateBookings[0]?.user?.name}` : isManualBlocked ? 'Click to unblock' : 'Click to block'}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-black transition-all border ${
                        isSysBlocked
                          ? 'bg-blue-900/30 border-blue-500/50 text-blue-400 cursor-not-allowed'
                          : isManualBlocked
                          ? 'bg-red-900/40 border-red-600 text-white hover:bg-red-700'
                          : 'bg-green-900/20 border-green-800 text-green-400 hover:border-luxe-gold hover:text-white'
                      }`}
                    >{day}</button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-3 mb-6 flex-wrap">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400"><div className="w-3 h-3 rounded bg-green-700" />Available</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400"><div className="w-3 h-3 rounded bg-red-700" />Manual Block</div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400"><div className="w-3 h-3 rounded bg-blue-700" />Customer Booking</div>
              </div>

              <button onClick={() => setSelectedCarSchedule(null)} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-luxe-gold transition">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PER-VEHICLE BOOKINGS MODAL --- */}
      <AnimatePresence>
        {selectedCarBookings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCarBookings(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-[#0a0a0a] border border-gray-800 rounded-3xl p-8 max-h-[85vh] overflow-y-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Booking <span className="text-luxe-gold">History</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{selectedCarBookings.make} {selectedCarBookings.model} — Stock: {selectedCarBookings.countInStock}</p>
              </div>

              <div className="space-y-4">
                {bookings.filter(b => b.car?._id === selectedCarBookings._id).length > 0 ? (
                  bookings.filter(b => b.car?._id === selectedCarBookings._id).map(b => (
                    <div key={b._id} className="bg-white/5 border border-gray-800 p-5 rounded-2xl hover:border-luxe-gold/30 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tighter">{b.user?.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold">{b.user?.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                            b.paymentStatus === 'paid' ? 'bg-green-900/30 text-green-400 border-green-500/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                          }`}>{b.paymentStatus}</span>
                          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${
                            b.dealerStatus === 'accepted' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                            b.dealerStatus === 'rejected' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                            'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                          }`}>{b.dealerStatus}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase text-gray-500">
                        <div><span className="text-gray-600">Pickup</span><br/><span className="text-white text-xs">{new Date(b.startDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                        <div><span className="text-gray-600">Return</span><br/><span className="text-white text-xs">{new Date(b.endDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-gray-600 uppercase text-xs font-bold tracking-widest">No bookings found for this vehicle.</div>
                )}
              </div>

              <button onClick={() => setSelectedCarBookings(null)} className="w-full mt-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-luxe-gold transition">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
