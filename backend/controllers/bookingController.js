const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// 🚀 CRITICAL FIX: Trim whitespace off the .env secrets to completely prevent Linux copy-paste HTTP 401 Unauthorized errors!
const razorpay = new Razorpay({
  key_id: (process.env.RAZORPAY_KEY_ID || 'dummy_id').trim(),
  key_secret: (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim(),
});

// @desc    Generate a Razorpay Order (does NOT save booking yet — only after verified payment)
const createCheckoutSession = async (req, res) => {
  try {
    const { carId, pricePerDay, rentalDays = 1 } = req.body;

    if (!carId || !pricePerDay) {
      return res.status(400).json({ message: 'Missing required fields: carId or pricePerDay' });
    }

    const totalPaiseAmount = Math.round(pricePerDay * 100 * rentalDays);

    const options = {
      amount: totalPaiseAmount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        carId: carId.toString(),
        pricePerDay: pricePerDay.toString(),
        rentalDays: rentalDays.toString(),
        userId: req.user._id.toString(),
      }
    };

    console.log("🟢 API SECURE GATEWAY: Hitting Razorpay servers with key: " + razorpay.key_id);
    const order = await razorpay.orders.create(options);
    console.log("🟢 200 SUCCESS API GATEWAY: Order created ID: ", order.id);

    if (!order) return res.status(500).send("Razorpay Network Error");

    // ✅ DO NOT create booking here — only create after payment is verified
    res.json(order);

  } catch (error) {
    console.error("🚨🚨🚨 FATAL NODEJS RAZORPAY FAILURE 🚨🚨🚨");
    console.error("Exact Reason: ", error);
    res.status(500).json({ message: 'Razorpay Gateway Blocked Request', error: error.message });
  }
};

// @desc    Verify the encrypted Razorpay Transaction Signature & CREATE the booking record
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      carId,
      pricePerDay,
      rentalDays = 1,
      deliveryLocation,
      licenseNo,
      phoneNo
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", (process.env.RAZORPAY_KEY_SECRET || 'dummy_secret').trim())
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid signature — payment tampered", success: false });
    }

    // ✅ Signature is valid — NOW create the confirmed booking record
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + rentalDays * 24 * 60 * 60 * 1000);

    const booking = await Booking.create({
      user: req.user._id,
      car: carId,
      startDate,
      endDate,
      totalCost: pricePerDay * rentalDays,
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'active',
      deliveryLocation,
      licenseNo,
      phoneNo,
      dealerStatus: 'pending'
    });

    console.log("✅ Booking confirmed and saved:", booking._id);
    res.status(200).json({ message: "Payment verified successfully", success: true, bookingId: booking._id });

  } catch (error) {
    console.error("🚨 verifyPayment error:", error);
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

// @desc    Update booking status (Admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { dealerStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.dealerStatus = dealerStatus;
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment, getMyBookings, getAllBookings, updateBookingStatus };
