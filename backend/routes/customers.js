// backend/src/routes/customers.js

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { exportHistory } = require('../controllers/customerController');

// Export customer history as CSV (secretary or the customer themself)
router.get(
  '/:id/history',
  requireAuth,
  exportHistory
);

module.exports = router;
