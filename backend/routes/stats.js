// backend/src/routes/stats.js

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getDashboardStats } = require('../controllers/statsController');

// Get dashboard statistics (by role)
router.get(
  '/dashboard',
  requireAuth,
  getDashboardStats
);

module.exports = router;
