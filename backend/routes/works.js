// backend/src/routes/works.js

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { addWork, getWorks } = require('../controllers/workController');

// Get all works for an appointment
// GET /api/appointments/:id/works
router.get(
  '/:id/works',
  requireAuth,
  getWorks
);

// Add a work record to an appointment
// POST /api/appointments/:id/works
router.post(
  '/:id/works',
  requireAuth,
  addWork
);

module.exports = router;
