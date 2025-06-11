// backend/src/routes/cars.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  bulkImportCars,
  getCars,
  searchCars,
  createCar,
  updateCar,
  deleteCar
} = require('../controllers/carController');

// Bulk import cars from CSV (secretary only)
router.post(
  '/import',
  requireAuth,
  requireRole(['secretary']),
  upload.single('file'),
  bulkImportCars
);

// Get all cars (customer sees only their own)
router.get(
  '/',
  requireAuth,
  getCars
);

// Search cars by serialNumber, brand, model, licensePlate
router.get(
  '/search',
  requireAuth,
  searchCars
);

// Create new car
router.post(
  '/',
  requireAuth,
  createCar
);

// Update car (customer only their own, secretary/mechanic all)
router.put(
  '/:id',
  requireAuth,
  updateCar
);

// Delete car (customer only their own, secretary/mechanic all)
router.delete(
  '/:id',
  requireAuth,
  deleteCar
);

module.exports = router;
