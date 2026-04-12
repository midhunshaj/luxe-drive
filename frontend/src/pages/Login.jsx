import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset, googleLogin } from '../features/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Grab our Redux global state variables
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    // If the user logs in successfully, redirect them to the fleet page
    if (isSuccess || user) {
      dispatch(reset());
      if (user.role === 'admin' || user.role === 'provider') {
        navigate('/admin');
      } else {
        navigate('/fleet');
      }
    }
  }, [user, isSuccess, navigate, dispatch]);

  const handleGoogleSuccess = (credentialResponse) => {
    dispatch(googleLogin(credentialResponse.credential));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-luxe-dark">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gray-900 border border-gray-800 p-10 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)] w-full max-w-md backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center mb-8 uppercase tracking-widest text-white">
          Universal <span className="text-luxe-gold">Portal</span>
          <p className="text-[10px] text-gray-500 mt-2 font-mono">MEMBERS / ACCREDITED PROVIDERS / SITE ADMINS</p>
        </h2>
        
        {isError && <div className="bg-red-900/40 border border-red-500 text-red-400 p-3 mb-4 rounded text-sm text-center font-medium">{message}</div>}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-gray-400 text-xs tracking-widest uppercase font-semibold mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-3 focus:outline-none focus:border-luxe-gold transition-colors"
              placeholder="vip@luxedrive.com"
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
              placeholder="• • • • • • • •"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-luxe-gold text-black font-bold py-3 mt-4 rounded uppercase tracking-wider hover:bg-yellow-500 transition-colors shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Access Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
           <hr className="w-full border-gray-800" />
           <span className="px-4 text-[10px] uppercase tracking-widest text-gray-600 font-bold whitespace-nowrap">Or Continue With</span>
           <hr className="w-full border-gray-800" />
        </div>

        <div className="mt-6 flex justify-center">
            <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => console.log('Login Failed')}
               theme="filled_black"
               shape="pill"
               width="320"
               text="continue_with"
            />
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          Not a member yet?{' '}
          <Link to="/register" className="text-luxe-gold hover:text-yellow-400 hover:underline transition-colors">Apply for Membership</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
