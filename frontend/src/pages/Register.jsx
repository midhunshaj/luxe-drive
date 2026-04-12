import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset, googleLogin } from '../features/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [companyName, setCompanyName] = useState('');
  const [customError, setCustomError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess || user) {
      dispatch(reset());
      navigate('/fleet');
    }
  }, [user, isSuccess, navigate, dispatch]);

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setCustomError('');
    if (password !== confirmPassword) {
      setCustomError('Passwords do not match');
    } else {
      dispatch(register({ name, email, password, role: accountType === 'provider' ? 'provider' : 'user', companyName: accountType === 'provider' ? companyName : '' }));
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-luxe-dark">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 border border-gray-800 p-10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-lg backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-widest text-white">
          Become a <span className="text-luxe-gold">Member</span>
        </h2>
        
        {(isError || customError) && (
          <div className="bg-red-900/40 border border-red-500 text-red-400 p-3 mb-4 rounded text-sm text-center">
            {customError || message}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-5">
          <div className="flex justify-center space-x-4 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="user" checked={accountType === 'user'} onChange={() => setAccountType('user')} className="text-luxe-gold focus:ring-luxe-gold" />
              <span className="text-sm text-gray-300 font-bold tracking-widest uppercase">Customer</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="provider" checked={accountType === 'provider'} onChange={() => setAccountType('provider')} className="text-luxe-gold focus:ring-luxe-gold" />
              <span className="text-sm text-gray-300 font-bold tracking-widest uppercase">Rental Provider</span>
            </label>
          </div>

          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">
              {accountType === 'provider' ? 'Director Name' : 'Full Legal Name'}
            </label>
            <input 
              type="text" 
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {accountType === 'provider' && (
            <div>
              <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Registered Company Name</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Enterprise Exotics"
                required={accountType === 'provider'}
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Confirm Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-luxe-gold text-black font-bold py-3 rounded uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-lg mt-6 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Submit Application'}
          </button>
        </form>

        <div className="mt-8 flex items-center justify-between">
           <hr className="w-full border-gray-800" />
           <span className="px-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold whitespace-nowrap">Or Faster Entry</span>
           <hr className="w-full border-gray-800" />
        </div>

        <div className="mt-6 flex justify-center">
            <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => console.log('Google Signup Failed')}
               theme="filled_black"
               shape="pill"
               width="340"
               text="signup_with"
            />
        </div>

        <div className="mt-10 text-center text-sm text-gray-400">
          Already a member?{' '}
          <Link to="/login" className="text-luxe-gold hover:text-yellow-400 hover:underline transition-colors">Sign In here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
