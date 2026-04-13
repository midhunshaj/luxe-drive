const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, updateUserProfile, toggleWishlist, getProviders, updateProviderStatus, getKycRequests, updateKycStatus: updateKycStatusCtrl, googleLogin, sendOtp, verifyOtp } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/wishlist').post(protect, toggleWishlist);
router.route('/providers').get(protect, admin, getProviders);
router.route('/providers/:id/status').put(protect, admin, updateProviderStatus);
router.get('/kyc-requests', protect, admin, getKycRequests);
router.put('/:id/kyc-status', protect, admin, updateKycStatusCtrl);
router.post('/google', googleLogin);

module.exports = router;
