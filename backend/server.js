// backend/src/server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const authRoutes        = require('./routes/auth');
const userRoutes        = require('./routes/users');
const carRoutes         = require('./routes/cars');
const appointmentRoutes = require('./routes/appointments');
const workRoutes        = require('./routes/works');
const statsRoutes       = require('./routes/stats');
const customerRoutes    = require('./routes/customers');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS για frontend στο http://localhost:3000
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Body parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,          // Σε production με HTTPS => true
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 2 // 2 ώρες
  }
}));

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/cars',         carRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointments', workRoutes);
app.use('/api/stats',        statsRoutes);
app.use('/api/customers',    customerRoutes);

// Στατική διαχείριση του φακέλου uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Εκκίνηση server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
