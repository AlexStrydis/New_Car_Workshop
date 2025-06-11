// backend/src/middleware/auth.js

// Middleware για να διασφαλίσει ότι ο χρήστης είναι αυθεντικοποιημένος
exports.requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Μη εξουσιοδοτημένη πρόσβαση' });
  }
  next();
};
