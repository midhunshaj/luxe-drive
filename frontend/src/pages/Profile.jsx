import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';
import { setCredentials } from '../features/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    licenseFront: '',
    licenseBack: '',
    idProofFront: '',
    idProofBack: ''
  });
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
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
    try {
      const { data } = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfileData({ ...profileData, [field]: data.url });
      setMessage(`${field} uploaded! Press Save to verify.`);
    } catch (error) {
      console.error(error);
      setMessage('Upload failed.');
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
      setMessage('Profile updated successfully! ✅');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Update failed. Try again.';
      setMessage(errMsg);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-luxe-dark text-white">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 border border-gray-800 p-10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-2xl backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-widest text-white">
          My <span className="text-luxe-gold">Profile</span>
        </h2>
        
        {message && <div className="bg-green-900/40 border border-green-500 text-green-400 p-3 mb-4 rounded text-sm text-center font-medium">{message}</div>}

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Name</label>
              <input type="text" name="name" className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors" value={profileData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Email Address</label>
              <input type="email" name="email" className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors" value={profileData.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Phone</label>
              <input type="text" name="phone" className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors" value={profileData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Address</label>
              <input type="text" name="address" className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors" value={profileData.address} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 mt-10">
            {/* --- KYC (KNOW YOUR CUSTOMER) SECTION --- */}
            <div className="border-t border-gray-800 pt-8 mt-4">
              <h3 className="text-xl font-bold uppercase tracking-widest text-luxe-gold mb-6 flex items-center">
                <span className="mr-3">📋</span> User KYC Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/*  LICENSE KYC */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white">License Documentation</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${user?.kycDetails?.licenseFront && user?.kycDetails?.licenseBack ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                      {user?.kycDetails?.licenseFront && user?.kycDetails?.licenseBack ? 'LICENSE READY' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-luxe-gold/50 cursor-pointer overflow-hidden group">
                       {user?.kycDetails?.licenseFront || profileData.licenseFront ? (
                         <img src={profileData.licenseFront || user.kycDetails.licenseFront} className="w-full h-full object-cover" />
                       ) : (
                         <label className="cursor-pointer text-center p-2">
                            <span className="text-xs font-bold text-gray-500 group-hover:text-luxe-gold">Add License Front</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, 'licenseFront')} />
                         </label>
                       )}
                    </div>
                    <div className="aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-luxe-gold/50 cursor-pointer overflow-hidden group">
                       {user?.kycDetails?.licenseBack || profileData.licenseBack ? (
                         <img src={profileData.licenseBack || user.kycDetails.licenseBack} className="w-full h-full object-cover" />
                       ) : (
                         <label className="cursor-pointer text-center p-2">
                            <span className="text-xs font-bold text-gray-500 group-hover:text-luxe-gold">Add License Back</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, 'licenseBack')} />
                         </label>
                       )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase italic">
                    {user?.kycDetails?.licenseFront && user?.kycDetails?.licenseBack ? '✅ License verification documents attached' : '⚠️ License upload pending, Please complete your KYC'}
                  </p>
                </div>

                {/* ID PROOF KYC */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white">Identity Proof</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${user?.kycDetails?.idProofFront && user?.kycDetails?.idProofBack ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                      {user?.kycDetails?.idProofFront && user?.kycDetails?.idProofBack ? 'ID PROOF READY' : 'PENDING'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-luxe-gold/50 cursor-pointer overflow-hidden group">
                       {user?.kycDetails?.idProofFront || profileData.idProofFront ? (
                         <img src={profileData.idProofFront || user.kycDetails.idProofFront} className="w-full h-full object-cover" />
                       ) : (
                         <label className="cursor-pointer text-center p-2">
                            <span className="text-xs font-bold text-gray-500 group-hover:text-luxe-gold">Add Id Proof Front</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, 'idProofFront')} />
                         </label>
                       )}
                    </div>
                    <div className="aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-luxe-gold/50 cursor-pointer overflow-hidden group">
                       {user?.kycDetails?.idProofBack || profileData.idProofBack ? (
                         <img src={profileData.idProofBack || user.kycDetails.idProofBack} className="w-full h-full object-cover" />
                       ) : (
                         <label className="cursor-pointer text-center p-2">
                            <span className="text-xs font-bold text-gray-500 group-hover:text-luxe-gold">Add Id Proof Back</span>
                            <input type="file" className="hidden" onChange={(e) => handleKycUpload(e, 'idProofBack')} />
                         </label>
                       )}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase italic">
                    {user?.kycDetails?.idProofFront && user?.kycDetails?.idProofBack ? '✅ Identity documents securely stored' : '⚠️ Id Proof upload pending, Please complete your KYC'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-luxe-gold text-black font-bold py-3 mt-10 rounded-xl uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            Save Changes & Verify KYC
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
