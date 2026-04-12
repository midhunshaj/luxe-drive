import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../features/authSlice';

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

  const submitHandler = async (e) => {
    e.preventDefault();
    setCustomError('');
    if (password !== confirmPassword) {
      setCustomError('Passwords do not match');
    } else {
      const role = accountType === 'provider' ? 'provider' : accountType === 'taxi_driver' ? 'taxi_driver' : 'user';
      dispatch(register({ name, email, password, role, companyName: (accountType === 'provider' || accountType === 'taxi_driver') ? companyName : '' }));
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
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" value="taxi_driver" checked={accountType === 'taxi_driver'} onChange={() => setAccountType('taxi_driver')} className="text-luxe-gold focus:ring-luxe-gold" />
              <span className="text-sm text-gray-300 font-bold tracking-widest uppercase">Taxi Driver</span>
            </label>
          </div>

          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">
              {accountType === 'provider' ? 'Director Name' : accountType === 'taxi_driver' ? 'Driver Name' : 'Full Legal Name'}
            </label>
            <input 
              type="text" 
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {(accountType === 'provider' || accountType === 'taxi_driver') && (
            <div>
              <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">
                {accountType === 'provider' ? 'Registered Company Name' : 'Taxi Operator Name'}
              </label>
              <input 
                type="text" 
                className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={accountType === 'provider' ? "e.g. Enterprise Exotics" : "e.g. Premium Airport Taxi"}
                required
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

        <div className="mt-8 text-center text-sm text-gray-400">
          Already a member?{' '}
          <Link to="/login" className="text-luxe-gold hover:text-yellow-400 hover:underline transition-colors">Sign In here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
