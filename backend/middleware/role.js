// backend/src/middleware/role.js

/**
 * Middleware για έλεγχο ρόλου χρήστη.
 * @param {string[]} roles - οι επιτρεπόμενοι ρόλοι, π.χ. ['secretary', 'mechanic']
 */
exports.requireRole = (roles) => (req, res, next) => {
  const userRole = req.session.userRole;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ error: 'Δεν έχετε δικαίωμα πρόσβασης' });
  }
  next();
};
