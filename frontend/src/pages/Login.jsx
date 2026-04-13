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
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
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
    <div className="min-h-screen flex items-center justify-center bg-luxe-dark px-6 relative overflow-hidden pt-24">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-luxe-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-luxe-gold/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card p-12 md:p-16 w-full max-w-lg relative border-white/5"
      >
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Welcome <span className="text-luxe-gold italic font-serif">Back</span></h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-bold">LuxeDrive Restricted Access</p>
        </div>
        
        {isError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-8 rounded-xl text-[10px] uppercase tracking-widest text-center font-bold"
          >
            {message}
          </motion.div>
        )}

        <form onSubmit={submitHandler} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Identity Handle</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
              placeholder="vip@luxedrive.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Secret Key</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full group relative py-5 overflow-hidden rounded-xl bg-white transition-all duration-500 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-luxe-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.4em] text-black group-hover:text-white transition-colors duration-500">
              {isLoading ? 'Authenticating...' : 'Access Portal'}
            </span>
          </button>
        </form>

        <div className="mt-12 flex items-center gap-6">
           <hr className="flex-1 border-white/5" />
           <span className="text-[9px] uppercase tracking-[0.3em] text-gray-600 font-bold whitespace-nowrap">External Authentication</span>
           <hr className="flex-1 border-white/5" />
        </div>

        <div className="mt-8 flex justify-center">
            <GoogleLogin
               onSuccess={handleGoogleSuccess}
               onError={() => console.log('Login Failed')}
               theme="filled_black"
               shape="pill"
               width="320"
               text="continue_with"
            />
        </div>

        <div className="mt-12 text-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 mr-2">New here?</span>
          <Link to="/register" className="text-[10px] uppercase tracking-[0.3em] text-luxe-gold font-bold hover:text-white transition-colors">
            Request Membership
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
