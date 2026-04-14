import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Fleet from './pages/Fleet';
import AdminDashboard from './pages/AdminDashboard';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Documentation from './pages/Documentation';

// ── Page transition wrapper ───────────────────────────────────────────────────
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

// ── Animated routes (must read location inside Router) ───────────────────────
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/fleet" element={<PageTransition><Fleet /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/my-bookings" element={<PageTransition><MyBookings /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/documentation" element={<PageTransition><Documentation /></PageTransition>} />
        <Route path="*" element={<PageTransition><div className="p-40 text-center text-4xl text-gray-500">Page Coming Soon!</div></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user && !user.token) {
      console.warn("🛡️ SESSION GUARD: Corrupted session detected (No Token). Force-cleaning local storage.");
      localStorage.removeItem('userInfo');
      window.location.reload();
    }
  }, [user]);

  return (
    <Router>
      <div className="min-h-screen font-sans selection:bg-luxe-gold selection:text-black cursor-none">
        <CustomCursor />

        {/* Global luxury toast notifications */}
        <Toaster
          position="bottom-right"
          gutter={12}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#111111',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '11px',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              padding: '14px 18px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#D4AF37', secondary: '#000' },
              style: {
                background: '#111111',
                border: '1px solid rgba(212,175,55,0.25)',
              },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#000' },
              style: {
                background: '#111111',
                border: '1px solid rgba(239,68,68,0.25)',
              },
            },
          }}
        />

        <Navbar />
        <AnimatedRoutes />
        <Footer />
      </div>
    </Router>
  );
}

export default App;

