const Car = require('../models/Car');

// @desc    Fetch all cars in the fleet (Inventory & Gallery)
// @route   GET /api/cars
// @access  Public
const getCars = async (req, res) => {
  try {
    const cars = await Car.find({});
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch completely detailed single car
// @route   GET /api/cars/:id
// @access  Public
const getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new car to the fleet
// @route   POST /api/cars
// @access  Private/Admin Only
const createCar = async (req, res) => {
  try {
    // The request body should match our Car Schema 
    // (make, model, year, pricePerDay, availabilityStatus, location, images)
    const car = new Car({ ...req.body });

    const createdCar = await car.save();
    res.status(201).json(createdCar);
  } catch (error) {
    res.status(400).json({ message: 'Invalid car data', error: error.message });
  }
};

// @desc    Update a car's details
// @route   PUT /api/cars/:id
// @access  Private/Admin Only
const updateCar = async (req, res) => {
  try {
    // findByIdAndUpdate merges the new body data while keeping the rest intact
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (car) {
      res.json(car);
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove a car from fleet
// @route   DELETE /api/cars/:id
// @access  Private/Admin Only
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (car) {
      res.json({ message: 'Vehicle officially removed from fleet inventory' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/cars/:id/reviews
// @access  Private
const createCarReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const car = await Car.findById(req.params.id);

    if (car) {
      const alreadyReviewed = car.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Car already reviewed' });
      }

      const review = {
        user: req.user._id,
        rating: Number(rating),
        comment,
      };

      car.reviews.push(review);
      car.numReviews = car.reviews.length;
      car.averageRating =
        car.reviews.reduce((acc, item) => item.rating + acc, 0) /
        car.reviews.length;

      await car.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar, createCarReview };
