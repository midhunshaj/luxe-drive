import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // 🛡️ SESSION GUARD: If user exists but token is corrupted/missing, force a hard reset
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
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/fleet" element={<Fleet />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documentation" element={<Documentation />} />
          <Route path="*" element={<div className="p-40 text-center text-4xl text-gray-500">Page Coming Soon!</div>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
