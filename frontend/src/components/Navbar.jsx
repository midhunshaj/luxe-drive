import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Fleet', path: '/fleet' },
    { name: 'Experience', path: '/documentation' },
  ];

  return (
    <nav className="fixed w-full z-[100] transition-all duration-500 bg-transparent">
      <div className="absolute inset-0 bg-luxe-dark/40 backdrop-blur-md border-b border-white/5" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
        <div className="flex items-center justify-between h-24">
          
          <Link to="/" className="group flex items-center gap-3 z-[110]">
            <div className="w-10 h-10 border border-luxe-gold flex items-center justify-center font-serif text-luxe-gold group-hover:bg-luxe-gold group-hover:text-black transition-all duration-500">
              L
            </div>
            <span className="text-xl font-serif tracking-[0.3em] font-light text-white group-hover:text-luxe-gold transition-colors">
              LUXE<span className="font-bold">DRIVE</span>
            </span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-12">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                to={link.path} 
                className="relative text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-luxe-gold transition-all duration-500 group-hover:w-full" />
              </Link>
            ))}

            {user ? (
               <div className="flex items-center gap-8 pl-8 border-l border-white/10">
                 {(user.role === 'admin' || (user.role === 'provider' && user.providerStatus === 'approved')) && (
                   <Link to="/admin" className="text-[10px] font-bold uppercase tracking-[0.3em] text-luxe-gold hover:text-white transition-colors group">
                     Dashboard
                     <span className="block h-[1px] w-0 group-hover:w-full bg-white transition-all duration-500" />
                   </Link>
                 )}
                 <Link to="/profile" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 hover:text-white transition-colors">Profile</Link>
                 <button 
                  onClick={onLogout} 
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-white/10 transition-colors"
                >
                  Logout
                </button>
               </div>
            ) : (
               <Link to="/login" className="group relative px-8 py-3 overflow-hidden rounded-full">
                 <div className="absolute inset-0 bg-white/5 border border-white/10 transition-all duration-500 group-hover:bg-luxe-gold group-hover:border-luxe-gold" />
                 <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.3em] text-white group-hover:text-black transition-colors">
                   Sign In
                 </span>
               </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden z-[110] flex flex-col gap-2 p-2"
          >
            <div className={`w-8 h-[1px] bg-white transition-all duration-500 ${isOpen ? 'rotate-45 translate-y-[4.5px]' : ''}`} />
            <div className={`w-8 h-[1px] bg-white transition-all duration-500 ${isOpen ? '-rotate-45 -translate-y-[4.5px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] md:hidden bg-luxe-dark p-8 overflow-hidden"
          >
            {/* Cinematic Background for Mobile Menu */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-luxe-dark/80 via-luxe-dark to-luxe-dark" />
            
            <div className="relative z-10 h-full flex flex-col pt-32 pb-12">
              <div className="flex flex-col gap-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    <Link 
                      to={link.path} 
                      onClick={() => setIsOpen(false)}
                      className="text-4xl font-serif text-white hover:text-luxe-gold transition-colors flex items-center gap-4 group"
                    >
                      <span className="text-xs font-serif italic text-luxe-gold opacity-40 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto space-y-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="h-[1px] w-full bg-white/5 shadow-[0_1px_0_rgba(255,255,255,0.05)]" 
                />
                
                <div className="grid grid-cols-2 gap-8">
                  {user ? (
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                        <Link to="/profile" onClick={() => setIsOpen(false)} className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Identity</span>
                          <span className="text-sm text-white font-serif italic">My Profile</span>
                        </Link>
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                        <Link to="/my-bookings" onClick={() => setIsOpen(false)} className="flex flex-col gap-1">
                          <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">Reservations</span>
                          <span className="text-sm text-white font-serif italic">Active Bookings</span>
                        </Link>
                      </motion.div>
                      {(user.role === 'admin' || user.role === 'provider') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                          <Link to="/admin" onClick={() => setIsOpen(false)} className="flex flex-col gap-1">
                            <span className="text-[9px] uppercase tracking-widest text-luxe-gold font-bold">Access Control</span>
                            <span className="text-sm text-luxe-gold font-serif italic font-bold">Dashboard ↵</span>
                          </Link>
                        </motion.div>
                      )}
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                        <button onClick={onLogout} className="flex flex-col gap-1 text-left">
                          <span className="text-[9px] uppercase tracking-widest text-red-500/50 font-bold">Termination</span>
                          <span className="text-sm text-red-500/80 font-serif italic">Log Out</span>
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 }}
                      className="col-span-2"
                    >
                      <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center py-5 bg-luxe-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full">
                        Secure Authentication
                      </Link>
                    </motion.div>
                  )}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                  className="flex justify-between items-center"
                >
                  <span className="text-[8px] uppercase tracking-[0.4em] text-gray-600 font-bold">© LuxeDrive 2026</span>
                  <div className="flex gap-4">
                    <div className="w-1 h-1 rounded-full bg-luxe-gold/30" />
                    <div className="w-1 h-1 rounded-full bg-luxe-gold/30" />
                    <div className="w-1 h-1 rounded-full bg-luxe-gold/30" />
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
