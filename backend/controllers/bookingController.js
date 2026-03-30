const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// 🚀 CRITICAL FIX: Trim whitespace off the .env secrets to completely prevent Linux copy-paste HTTP 401 Unauthorized errors!
const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || 'dummy_id').trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim(),
});

// @desc    Generate a Razorpay Order 
const createCheckoutSession = async (req, res) => {
  try {
    const { carId, pricePerDay } = req.body;
    const rentalDays = 1;
    const totalPaiseAmount = (pricePerDay * 100) * rentalDays;

    const options = {
      amount: totalPaiseAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`, 
    };

    console.log("🟢 API SECURE GATEWAY: Hitting Razorpay servers with key: " + razorpay.key_id);
    const order = await razorpay.orders.create(options);
    console.log("🟢 200 SUCCESS API GATEWAY: Order created ID: ", order.id);

    if (!order) return res.status(500).send("Razorpay Network Error");

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + rentalDays * 24 * 60 * 60 * 1000);

    // Save the pending booking to the database
    await Booking.create({
      user: req.user._id,
      car: carId,
      startDate: startDate,
      endDate: endDate,
      totalCost: pricePerDay * rentalDays,
      paymentStatus: 'pending',
      razorpayOrderId: order.id,
      status: 'active'
    });

    res.json(order);

  } catch (error) {
    console.error("🚨🚨🚨 FATAL NODEJS RAZORPAY FAILURE 🚨🚨🚨");
    console.error("Exact Reason: ", error);
    res.status(500).json({ message: 'Razorpay Gateway Blocked Request', error: error });
  }
};

// @desc    Verify the encrypted Razorpay Transaction Signature
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim())
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      await Booking.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { paymentStatus: 'paid', razorpayPaymentId: razorpay_payment_id }
      );
      res.status(200).json({ message: "Payment verified successfully", success: true });
    } else {
      res.status(400).json({ message: "Invalid signature", success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// @desc    Get user's own bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('car').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// @desc    Get all bookings (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email').populate('car').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment, getMyBookings, getAllBookings };
