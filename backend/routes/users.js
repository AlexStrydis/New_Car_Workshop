// backend/src/routes/users.js

const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const {
  bulkImportUsers,
  getUsers,
  searchUsers,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Bulk import users from CSV (secretary only)
router.post(
  '/import',
  requireAuth,
  requireRole(['secretary']),
  upload.single('file'),
  bulkImportUsers
);

// Get all users (secretary only)
router.get(
  '/',
  requireAuth,
  requireRole(['secretary']),
  getUsers
);

// Search users by username, lastName, vatNumber (secretary only)
router.get(
  '/search',
  requireAuth,
  requireRole(['secretary']),
  searchUsers
);

// Update a user (self or secretary)
router.put(
  '/:id',
  requireAuth,
  updateUser
);

// Delete a user (self or secretary)
router.delete(
  '/:id',
  requireAuth,
  deleteUser
);

module.exports = router;
