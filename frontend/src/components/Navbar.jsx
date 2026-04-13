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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] md:hidden bg-luxe-dark flex flex-col items-center justify-center p-8"
          >
            <div className="absolute top-0 right-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-luxe-dark/90" />
            
            <div className="relative z-10 flex flex-col items-center gap-12 text-center">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="text-4xl font-serif text-white hover:text-luxe-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-[1px] w-24 bg-white/10" />
              
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="text-xl font-serif text-white/50">Profile</Link>
                  <button onClick={onLogout} className="text-xl font-serif text-red-500/70">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="text-2xl font-serif text-luxe-gold">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
