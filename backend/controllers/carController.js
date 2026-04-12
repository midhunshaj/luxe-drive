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
    const carData = { ...req.body };
    
    // Safety: Link car to provider if role is provider
    if (req.user.role === 'provider') {
      carData.providerId = req.user._id;
      carData.dealerName = req.user.companyName; // Enforce provider's company name
    }

    const car = new Car(carData);
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
    const updateData = { ...req.body };

    // Safety: Ensure providers can't hijack other providers' vehicles or change dealerName
    if (req.user.role === 'provider') {
      const carToUpdate = await Car.findById(req.params.id);
      if (!carToUpdate || !carToUpdate.providerId || carToUpdate.providerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this vehicle or legacy data' });
      }
      updateData.dealerName = req.user.companyName;
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    const carToRemove = await Car.findById(req.params.id);
    
    if (!carToRemove) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Security check: Admins can delete anything, providers only their own
    if (req.user.role === 'provider' && carToRemove.providerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this vehicle' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle officially removed from fleet inventory' });
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
