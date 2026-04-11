import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Live session-tracking! The Navbar physically transforms based on who logged in
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout()); // Flushes the encrypted JWT completely out of browser storage
    dispatch(reset());
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-luxe-dark/80 backdrop-blur-md border-b border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link to="/" className="text-2xl font-bold tracking-widest text-white">
            LUXE<span className="text-luxe-gold">DRIVE</span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8 items-center">
              <Link to="/fleet" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">Our Fleet</Link>
              
              {user ? (
                <>
                  {/* Highly-Guarded Admin Route Visibility */}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-sm font-black uppercase tracking-widest text-luxe-gold hover:text-white transition-colors duration-300">
                      ♦ Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">
                    Profile
                  </Link>
                  <Link to="/my-bookings" className="text-sm uppercase tracking-wider text-gray-300 hover:text-luxe-gold transition-colors duration-300">
                    My Bookings
                  </Link>
                  <button onClick={onLogout} className="px-6 py-2 rounded text-gray-300 hover:text-red-500 text-sm tracking-widest uppercase font-semibold transition-colors duration-300">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-6 py-2 rounded border border-luxe-gold text-luxe-gold hover:bg-luxe-gold hover:text-black font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
