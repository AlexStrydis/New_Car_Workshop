// backend/src/routes/auth.js

const express = require('express');
const router = express.Router();
const { login, logout, register } = require('../controllers/authController');

// Login (public)
router.post('/login', login);

// Logout (requires session)
router.post('/logout', logout);

// Register new user (public)
router.post('/register', register);

module.exports = router;
