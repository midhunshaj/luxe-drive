const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const nodemailer = require('nodemailer');

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
    
    if (razorpay.key_id === 'dummy_id' || razorpay.key_id.length < 5) {
      console.error("❌ CRITICAL: Valid RAZORPAY_KEY_ID missing in .env!");
      return res.status(500).json({ message: 'LuxeDrive Payment System is misconfigured. RAZORPAY_KEY_ID is missing.' });
    }

    const order = await razorpay.orders.create(options);
    console.log("🟢 200 SUCCESS API GATEWAY: Order created ID: ", order.id);

    if (!order) return res.status(500).send("Razorpay Network Error");

    // ✅ DO NOT create booking here — only create after payment is verified
    res.json(order);

  } catch (error) {
    console.error("🚨🚨🚨 FATAL NODEJS RAZORPAY FAILURE 🚨🚨🚨");
    console.error("Razorpay Error Code: ", error.error?.code);
    console.error("Razorpay Error Desc: ", error.error?.description);
    console.error("Full Trace: ", error);
    res.status(500).json({ 
      message: 'Razorpay Gateway Blocked Request', 
      error: error.error?.description || error.message 
    });
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

    // 🚀 INVENTORY SYNC: Decrement the car's available stock counts
    const carToUpdate = await Car.findById(carId);
    if (carToUpdate) {
      carToUpdate.countInStock = Math.max(0, carToUpdate.countInStock - 1);
      await carToUpdate.save();

      // 📡 WEBSOCKET BROADCAST: Inform ALL connected browsers that stock has changed!
      const io = req.app.get('io');
      if (io) {
        io.emit('inventoryUpdate', { 
          carId: carToUpdate._id, 
          newCount: carToUpdate.countInStock 
        });
      }
    }

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

// @desc    Get all bookings (Admin & Provider)
const getAllBookings = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'provider') {
      // Find all cars belonging to this provider to filter bookings
      const providerCars = await Car.find({ providerId: req.user._id }).select('_id');
      const carIds = providerCars.map(c => c._id);
      query = { car: { $in: carIds } };
    }

    const bookings = await Booking.find(query).populate('user', 'name email').populate('car').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all bookings', error: error.message });
  }
};

// @desc    Update booking status (Admin & Owner Provider)
const updateBookingStatus = async (req, res) => {
  try {
    const { dealerStatus } = req.body;
    const booking = await Booking.findById(req.params.id).populate('user').populate('car');

    if (booking) {
      // Security: Only allow update if Admin OR if Provider owns the vehicle
      if (req.user.role === 'provider' && booking.car?.providerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to manage this booking' });
      }

      booking.dealerStatus = dealerStatus;
      const updatedBooking = await booking.save();

      // Email Dispatch System
      if (dealerStatus === 'accepted' && booking.user?.email) {
        try {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER || 'dummy@gmail.com',
              pass: process.env.EMAIL_PASS || 'dummy'
            }
          });

          const mailOptions = {
            from: `"LuxeDrive Reservations" <${process.env.EMAIL_USER || 'dummy@gmail.com'}>`,
            to: booking.user.email,
            subject: 'LuxeDrive Booking Confirmation ✅',
            html: `
              <h2>Booking Successful! ✅</h2>
              <p>Dear ${booking.user.name},</p>
              <p>Your reservation for the <strong>${booking.car?.make} ${booking.car?.model}</strong> has been officially approved.</p>
              <p>The vehicle will be delivered to you as soon as possible.</p>
              <p>Ref ID: ${booking._id}</p>
              <p>Thank you for choosing LuxeDrive.</p>
            `
          };

          await transporter.sendMail(mailOptions);
          console.log(`Confirmation Mail sent to ${booking.user.email}`);
        } catch (mailError) {
          console.error("Mail Error (Requires real credentials in .env): ", mailError.message);
        }
      }

      // Real-time Push Notification via Socket.io
      const io = req.app.get('io');
      if (io) {
        io.to(booking.user._id.toString()).emit('statusUpdate', {
          bookingId: booking._id,
          dealerStatus: dealerStatus
        });
      }

      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a Donation Order (29 INR)
// @route   POST /api/bookings/donate
// @access  Public
const createDonationOrder = async (req, res) => {
  try {
    const options = {
      amount: 4900, // 49.00 INR in paise
      currency: "INR",
      receipt: `don_${Date.now()}`,
      notes: { type: 'donation' }
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  verifyPayment,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  createDonationOrder
};
