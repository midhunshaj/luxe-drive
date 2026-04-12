import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/authSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Live session-tracking! The Navbar physically transforms based on who logged in
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout()); // Flushes the encrypted JWT completely out of browser storage
    dispatch(reset());
    setIsOpen(false);
    navigate('/');
  };

  const MobileLink = ({ to, children, className }) => (
    <Link 
      to={to} 
      onClick={() => setIsOpen(false)} 
      className={`block px-3 py-4 rounded-md text-base font-bold tracking-widest uppercase transition-colors ${className}`}
    >
      {children}
    </Link>
  );

  return (
    <nav className="fixed w-full z-50 bg-luxe-dark/95 backdrop-blur-xl border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" onClick={() => setIsOpen(false)} className="text-2xl font-bold tracking-widest text-white z-50">
            LUXE<span className="text-luxe-gold">DRIVE</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/fleet" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">Our Fleet</Link>
            
            {user ? (
               <>
                 {(user.role === 'admin' || (user.role === 'provider' && user.providerStatus === 'approved')) && (
                   <Link to="/admin" className="text-sm font-black uppercase tracking-widest text-luxe-gold hover:text-white transition-colors duration-300">
                     ♦ {user.role === 'admin' ? 'Admin Panel' : 'Business Center'}
                   </Link>
                 )}
                 <Link to="/profile" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">Profile</Link>
                 <Link to="/my-bookings" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">My Bookings</Link>
                 <button onClick={onLogout} className="px-6 py-2 rounded text-gray-300 hover:text-red-500 text-sm tracking-widest uppercase font-semibold transition-colors duration-300">Logout</button>
               </>
            ) : (
               <Link to="/login" className="px-6 py-2 rounded border border-luxe-gold text-luxe-gold hover:bg-luxe-gold hover:text-black font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                 Sign In
               </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-luxe-gold focus:outline-none p-2"
            >
              <svg className="h-8 w-8 transition-transform duration-300" 
                   style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }} 
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slide-down using Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-b border-gray-800 bg-black/90 backdrop-blur overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3 text-center">
              <MobileLink to="/fleet" className="text-gray-300 hover:text-luxe-gold hover:bg-gray-900 mt-4">Our Fleet</MobileLink>
              
              {user ? (
                <>
                  {(user.role === 'admin' || (user.role === 'provider' && user.providerStatus === 'approved')) && (
                    <MobileLink to="/admin" className="text-luxe-gold hover:text-white bg-luxe-gold/10 hover:bg-luxe-gold/20">
                      ♦ {user.role === 'admin' ? 'Operations Panel' : 'Business Center'}
                    </MobileLink>
                  )}
                  <MobileLink to="/profile" className="text-gray-300 hover:text-luxe-gold hover:bg-gray-900">Profile</MobileLink>
                  <MobileLink to="/my-bookings" className="text-gray-300 hover:text-luxe-gold hover:bg-gray-900">My Bookings</MobileLink>
                  <button 
                    onClick={onLogout} 
                    className="w-full text-center block px-3 py-4 mt-4 rounded-md text-base font-bold tracking-widest uppercase text-red-500 hover:bg-red-900/20 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-4 pb-2">
                  <Link 
                    to="/login" 
                    onClick={() => setIsOpen(false)}
                    className="block w-full px-6 py-4 rounded border border-luxe-gold text-luxe-gold hover:bg-luxe-gold hover:text-black font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] uppercase tracking-widest"
                  >
                    Sign In to Portal
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
