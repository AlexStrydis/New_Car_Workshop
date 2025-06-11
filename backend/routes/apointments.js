// backend/src/routes/appointments.js

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment
} = require('../controllers/appointmentController');

// Όλοι οι αυθεντικοί χρήστες μπορούν να δουν ραντεβού
router.get(
  '/',
  requireAuth,
  getAppointments
);

// Δημιουργία νέου ραντεβιού (customer, secretary)
router.post(
  '/',
  requireAuth,
  createAppointment
);

// Ενημέρωση ραντεβιού (customer μόνο δικά του όταν status='created', secretary οποιοδήποτε)
router.put(
  '/:id',
  requireAuth,
  updateAppointment
);

// Ακύρωση ραντεβιού (customer μόνο δικά του, secretary οποιοδήποτε)
router.post(
  '/:id/cancel',
  requireAuth,
  cancelAppointment
);

module.exports = router;
