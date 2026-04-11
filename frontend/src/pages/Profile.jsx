import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import axios from 'axios';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    driverLicenseUrl: '',
    password: ''
  });
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        driverLicenseUrl: user.driverLicenseUrl || '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/users/profile', profileData, config);
      setMessage('Profile updated successfully!');
      // Assuming you might update redux state here in a real app
    } catch (error) {
      setMessage('Update failed. Try again.');
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
            <div className="md:col-span-2">
               <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Driver License Image URL</label>
               <input type="text" name="driverLicenseUrl" className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors" value={profileData.driverLicenseUrl} onChange={handleChange} placeholder="https://..." />
            </div>
          </div>

          <button type="submit" className="w-full bg-luxe-gold text-black font-bold py-3 mt-4 rounded uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-lg">
            Update Profile Data
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
