import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { setCredentials } from '../features/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState({
    name: '', email: '', phone: '', address: '', password: '',
    licenseFront: '', licenseBack: '', idProofFront: '', idProofBack: ''
  });
  
  const [isUploading, setIsUploading] = useState({
    licenseFront: false, licenseBack: false, idProofFront: false, idProofBack: false
  });
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '', email: user.email || '', phone: user.phone || '', address: user.address || '',
        password: '',
        licenseFront: user.kycDetails?.licenseFront || '',
        licenseBack: user.kycDetails?.licenseBack || '',
        idProofFront: user.kycDetails?.idProofFront || '',
        idProofBack: user.kycDetails?.idProofBack || ''
      });
    }
  }, [user]);

  const handleKycUpload = async (e, field) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(prev => ({ ...prev, [field]: true }));
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData({ ...profileData, [field]: data.url });
      setMessage(`${field.toUpperCase()} uploaded. Press Save to sync.`);
    } catch (error) {
      setMessage('Upload failed.');
    } finally {
      setIsUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/users/profile', profileData, config);
      dispatch(setCredentials(data));
      setMessage('Identity parameters synchronized successfully. ✅');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Synchronization failed.');
    }
  };

  return (
    <div className="min-h-screen bg-luxe-dark text-white pb-32">
      <section className="relative pt-44 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 blur-3xl pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-luxe-gold/5 rounded-full" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-luxe-gold font-bold">Secure Dashboard</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-7xl font-serif"
          >
            Profile <span className="text-luxe-gold italic font-serif">&</span> Identity
          </motion.h1>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 p-4 mb-12 rounded-xl text-[10px] uppercase tracking-widest text-center font-bold text-luxe-gold"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={submitHandler} className="space-y-16">
          <div className="glass-card p-12 space-y-12">
            <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/80 border-b border-white/5 pb-6">Core Authentication</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Legal Name</label>
                <input type="text" name="name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm" value={profileData.name} onChange={handleChange} required />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Secure Email</label>
                <input type="email" name="email" className="w-full bg-white/10 border border-white/10 rounded-xl p-4 text-white/50 cursor-not-allowed text-sm" value={profileData.email} disabled />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Identity Contact</label>
                <input type="text" name="phone" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm" value={profileData.phone} onChange={handleChange} />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Residency</label>
                <input type="text" name="address" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm" value={profileData.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="glass-card p-12 space-y-12">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-white/80">KYC Documentation</h3>
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest uppercase border ${user?.kycStatus === 'approved' ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                {user?.kycStatus === 'approved' ? 'Verified Entity' : 'Pending Verification'}
              </div>
            </div>

            <div className="space-y-12">
              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Operator Privilege License</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['licenseFront', 'licenseBack'].map(field => (
                    <div key={field} className="relative aspect-video rounded-2xl bg-white/5 border border-white/10 border-dashed hover:border-luxe-gold/50 transition-colors group overflow-hidden">
                      {isUploading[field] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="w-6 h-6 border-2 border-luxe-gold border-t-transparent rounded-full animate-spin mb-3" />
                          <span className="text-[9px] uppercase tracking-[0.3em] text-luxe-gold animate-pulse">Syncing...</span>
                        </div>
                      ) : profileData[field] ? (
                        <>
                          <img src={profileData[field]} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white border-b border-luxe-gold pb-1">Replace Fragment</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, field)} />
                          </label>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <span className="text-2xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity">📸</span>
                          <span className="text-[9px] font-bold text-gray-600 group-hover:text-luxe-gold uppercase tracking-[0.2em]">Add {field.includes('Front') ? 'Primary' : 'Secondary'} Side</span>
                          <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, field)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Identity Verification Protocol</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['idProofFront', 'idProofBack'].map(field => (
                    <div key={field} className="relative aspect-video rounded-2xl bg-white/5 border border-white/10 border-dashed hover:border-luxe-gold/50 transition-colors group overflow-hidden">
                      {isUploading[field] ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                          <div className="w-6 h-6 border-2 border-luxe-gold border-t-transparent rounded-full animate-spin mb-3" />
                          <span className="text-[9px] uppercase tracking-[0.3em] text-luxe-gold animate-pulse">Syncing...</span>
                        </div>
                      ) : profileData[field] ? (
                        <>
                          <img src={profileData[field]} className="w-full h-full object-cover" />
                          <label className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm">
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white border-b border-luxe-gold pb-1">Replace Fragment</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, field)} />
                          </label>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                          <span className="text-2xl mb-2 opacity-30 group-hover:opacity-100 transition-opacity">📸</span>
                          <span className="text-[9px] font-bold text-gray-600 group-hover:text-luxe-gold uppercase tracking-[0.2em]">Add {field.includes('Front') ? 'Primary' : 'Secondary'} Side</span>
                          <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, field)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full group relative py-6 overflow-hidden rounded-2xl bg-white transition-all duration-500"
          >
            <div className="absolute inset-0 bg-luxe-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.5em] text-black group-hover:text-white transition-colors duration-500">
              Update Identity Parameters
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
