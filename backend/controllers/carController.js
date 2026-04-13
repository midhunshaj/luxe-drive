const Car = require('../models/Car');
const Booking = require('../models/Booking');

// @desc    Fetch all cars in the fleet (Inventory & Gallery)
// @route   GET /api/cars?startDate=...&endDate=...
// @access  Public
const getCars = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let cars = await Car.find({});

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      // 1. Find all active/paid bookings that overlap with requested range
      const overlappingBookings = await Booking.find({
        status: { $ne: 'cancelled' },
        paymentStatus: 'paid',
        $and: [
          { startDate: { $lt: end } },  // Booking starts before requested ends
          { endDate: { $gt: start } }   // Booking ends after requested starts
        ]
      });

      // 2. Map bookings to car IDs for efficiency
      const busyCounts = overlappingBookings.reduce((acc, booking) => {
        const carId = booking.car.toString();
        acc[carId] = (acc[carId] || 0) + 1;
        return acc;
      }, {});

      // 3. Mark cars as unavailable if stock is exhausted or manually blocked
      cars = cars.map(car => {
        const carId = car._id.toString();
        const carObj = car.toObject();
        const busy = busyCounts[carId] || 0;
        
        // Calculate wait time
        const carBookings = overlappingBookings.filter(b => b.car.toString() === carId);
        if (carBookings.length > 0 && busy >= car.countInStock) {
           const returnTimes = carBookings.map(b => new Date(b.endDate).getTime());
           carObj.nextAvailableAt = new Date(Math.min(...returnTimes));
        }

        // Check manual blocks — use raw query strings to avoid any UTC/IST offset shift
        const startDay = startDate.substring(0, 10); // e.g. "2026-04-13"
        const endDay = endDate.substring(0, 10);
        const isManuallyBlocked = car.blockedDates?.some(dateStr => {
          const blockedDay = dateStr.substring(0, 10);
          return blockedDay >= startDay && blockedDay <= endDay;
        });

        carObj.availableUnits = Math.max(0, car.countInStock - busy);
        carObj.isAvailableForDates = carObj.availableUnits > 0 && !isManuallyBlocked;
        return carObj;
      });
    }

    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleBlockedDate = async (req, res) => {
  try {
    const { date } = req.body;
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    const index = car.blockedDates.indexOf(date);
    if (index > -1) car.blockedDates.splice(index, 1);
    else car.blockedDates.push(date);
    await car.save();
    res.json(car);
  } catch (error) { res.status(500).json({ message: error.message }); }
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

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar, createCarReview, toggleBlockedDate };
