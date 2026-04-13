const express = require('express');
const router = express.Router();
const { getCars, getCarById, createCar, updateCar, deleteCar, createCarReview, toggleBlockedDate } = require('../controllers/carController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCars)       // Public: View all cars
  .post(protect, admin, createCar); // Admin Only: Add new car

router.route('/:id/reviews').post(protect, createCarReview);

router.route('/:id/availability').put(protect, admin, toggleBlockedDate);

router.route('/:id')
  .get(getCarById)     // Public: View single car
  .put(protect, admin, updateCar)      // Admin Only: Edit car
  .delete(protect, admin, deleteCar);  // Admin Only: Delete car

module.exports = router;
