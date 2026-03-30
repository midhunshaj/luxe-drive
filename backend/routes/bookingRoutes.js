const express = require('express');
const router = express.Router();
const { createCheckoutSession, verifyPayment, getMyBookings, getAllBookings } = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/checkout', protect, createCheckoutSession);
router.post('/verify', protect, verifyPayment);
router.get('/mybookings', protect, getMyBookings);
router.get('/', protect, admin, getAllBookings);

module.exports = router;
