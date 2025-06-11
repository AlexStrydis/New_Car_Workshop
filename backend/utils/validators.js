// backend/src/utils/validators.js

/**
 * Ελέγχει αν ένα email έχει έγκυρη σύνταξη.
 * @param {string} email 
 * @returns {boolean}
 */
exports.validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Ελέγχει αν ένας τηλεφωνικός αριθμός είναι έγκυρος ελληνικός (10 ψηφία, με ή χωρίς +30/0).
 * @param {string} phone 
 * @returns {boolean}
 */
exports.validateGreekPhone = (phone) => {
  const cleaned = phone.replace(/[\s-]/g, '');
  const re = /^(\+30|0)?[0-9]{10}$/;
  return re.test(cleaned);
};
