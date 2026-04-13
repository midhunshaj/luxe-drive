import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { register, reset } from '../features/authSlice';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('user');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [customError, setCustomError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isSuccess || user) {
      dispatch(reset());
      navigate('/fleet');
    }
  }, [user, isSuccess, navigate, dispatch]);

  const sendOtpHandler = async () => {
    if (!phone || phone.length < 10) {
      setCustomError('Enter a valid mobile number');
      return;
    }
    setOtpLoading(true);
    setCustomError('');
    try {
      await axios.post('/api/users/send-otp', { phone });
      setOtpSent(true);
    } catch (err) {
      setCustomError(err.response?.data?.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtpHandler = async () => {
    setOtpLoading(true);
    try {
      const { data } = await axios.post('/api/users/verify-otp', { phone, code: otp });
      if (data.success) {
        setIsVerified(true);
        setCustomError('');
      }
    } catch (err) {
      setCustomError('Code invalid');
    } finally {
      setOtpLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setCustomError('');
    if (!isVerified) {
      setCustomError('Verification required');
      return;
    }
    if (password !== confirmPassword) {
      setCustomError('Keys do not match');
    } else {
      dispatch(register({ 
        name, email, password, 
        role: accountType === 'provider' ? 'provider' : 'user', 
        companyName: accountType === 'provider' ? companyName : '',
        phone 
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-luxe-dark px-6 py-20 relative overflow-hidden pt-32">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-luxe-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-luxe-gold/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass-card p-8 md:p-16 w-full max-w-2xl relative border-white/5"
      >
        <div className="mb-10 md:mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-3 md:mb-4">Request <span className="text-luxe-gold italic font-serif">Access</span></h2>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 font-bold">LuxeDrive Membership Application</p>
        </div>
        
        {(isError || customError) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 mb-8 rounded-xl text-[10px] uppercase tracking-widest text-center font-bold"
          >
            {customError || message}
          </motion.div>
        )}

        <form onSubmit={submitHandler} className="space-y-8">
          <div className="flex justify-center flex-wrap gap-8 mb-4">
            {['user', 'provider'].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${accountType === type ? 'border-luxe-gold' : 'border-white/20 group-hover:border-white/40'}`}>
                  {accountType === type && <div className="w-2 h-2 rounded-full bg-luxe-gold" />}
                </div>
                <input type="radio" value={type} checked={accountType === type} onChange={() => setAccountType(type)} className="hidden" />
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${accountType === type ? 'text-white' : 'text-gray-500'}`}>
                  {type === 'user' ? 'Individual' : 'Professional Provider'}
                </span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">
                {accountType === 'provider' ? 'Director Identity' : 'Legal Handle'}
              </label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Communication Handle</label>
              <input 
                type="email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {accountType === 'provider' && (
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Corporate Entity</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Registered Enterprise Name"
                required
              />
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Secure Mobile Connection</label>
            <div className="flex gap-4">
              <input 
                type="tel" 
                className={`flex-1 bg-white/5 border ${isVerified ? 'border-green-500/50' : 'border-white/10'} rounded-xl p-4 text-white focus:outline-none focus:border-luxe-gold transition text-sm`}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit primary contact"
                disabled={isVerified}
                required
              />
              {!isVerified && !otpSent && (
                <button 
                  type="button" 
                  onClick={sendOtpHandler}
                  disabled={otpLoading}
                  className="px-8 bg-white/5 border border-white/10 rounded-xl text-[9px] font-bold uppercase tracking-widest text-luxe-gold hover:bg-luxe-gold hover:text-black transition-all"
                >
                  {otpLoading ? '...' : 'Verify'}
                </button>
              )}
            </div>
            {isVerified && <p className="text-[9px] text-green-500 uppercase font-bold tracking-[0.2em] ml-1 flex items-center gap-2"><span>✓</span> Authenticated</p>}
          </div>

          {otpSent && !isVerified && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-luxe-gold font-bold ml-1">Security Code</label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  maxLength="6"
                  className="flex-1 bg-white/5 border border-luxe-gold/30 rounded-xl p-4 text-white text-center tracking-[0.5em] font-bold focus:outline-none"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={verifyOtpHandler}
                  className="px-8 bg-luxe-gold text-black rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Secret Key</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-[0.3em] text-gray-500 font-bold ml-1">Confirm Key</label>
              <input 
                type="password" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white hover:border-white/30 focus:border-luxe-gold outline-none transition text-sm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full group relative py-5 overflow-hidden rounded-xl bg-white transition-all duration-500 disabled:opacity-50 mt-4"
          >
            <div className="absolute inset-0 bg-luxe-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.4em] text-black group-hover:text-white transition-colors duration-500">
              {isLoading ? 'Processing...' : 'Submit Credentials'}
            </span>
          </button>
        </form>

        <div className="mt-12 text-center">
          <span className="text-[10px] uppercase tracking-widest text-gray-500 mr-2">Acknowledged member?</span>
          <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] text-luxe-gold font-bold hover:text-white transition-colors">
            Access Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
