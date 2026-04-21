const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all visitor stats
// @route   GET /api/analytics
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const totalVisitors = await Visitor.countDocuments();
    const activeVisitors = await Visitor.countDocuments({ endTime: { $exists: false } });
    
    // Average duration of completed sessions
    const completedSessions = await Visitor.find({ endTime: { $exists: true } });
    const avgDuration = completedSessions.length > 0 
      ? completedSessions.reduce((acc, sess) => acc + sess.duration, 0) / completedSessions.length 
      : 0;

    // Recent visitors
    const recentVisitors = await Visitor.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email');

    res.json({
      totalVisitors,
      activeVisitors,
      avgDuration: Math.round(avgDuration),
      recentVisitors
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching analytics' });
  }
});

module.exports = router;
