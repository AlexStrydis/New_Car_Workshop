// backend/src/controllers/authController.js

const pool = require('../src/config/db');
const bcrypt = require('bcrypt');
const { validateEmail } = require('../utils/validators');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // Αναζήτηση ενεργού χρήστη με username
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
      [username]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: 'Λάθος στοιχεία εισόδου' });
    }
    const user = users[0];

    // Έλεγχος κωδικού
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Λάθος στοιχεία εισόδου' });
    }

    // Αποθήκευση session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Φόρτωση επιπλέον πληροφοριών ανά ρόλο
    let additional = {};
    if (user.role === 'customer') {
      const [rows] = await pool.execute(
        'SELECT id, vat_number, address, phone FROM customers WHERE user_id = ?',
        [user.id]
      );
      additional = rows[0] || {};
    } else if (user.role === 'mechanic') {
      const [rows] = await pool.execute(
        'SELECT id, specialty, phone FROM mechanics WHERE user_id = ?',
        [user.id]
      );
      additional = rows[0] || {};
    }

    // Επιστροφή user info
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
      ...additional
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Σφάλμα κατά τη σύνδεση' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Σφάλμα κατά την αποσύνδεση' });
    }
    res.json({ message: 'Επιτυχής αποσύνδεση' });
  });
};

exports.register = async (req, res) => {
  const {
    username,
    password,
    email,
    firstName,
    lastName,
    identityNumber,
    role,
    vatNumber,
    address,
    phone,
    specialty
  } = req.body;

  // Βασικός έλεγχος υποχρεωτικών πεδίων
  if (!username || !password || !email || !firstName || !lastName || !identityNumber || !role) {
    return res.status(400).json({ error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Μη έγκυρο email' });
  }
  if (role === 'secretary') {
    return res.status(403).json({ error: 'Δεν επιτρέπεται η εγγραφή γραμματέων' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Έλεγχος μοναδικότητας
    const [exists] = await conn.execute(
      'SELECT id FROM users WHERE username = ? OR email = ? OR identity_number = ?',
      [username, email, identityNumber]
    );
    if (exists.length > 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Υπάρχει ήδη χρήστης με αυτά τα στοιχεία' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await conn.execute(
      `INSERT INTO users
       (username, password, email, first_name, last_name, identity_number, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [username, hashed, email, firstName, lastName, identityNumber, role]
    );
    const userId = result.insertId;

    // Εισαγωγή σε customers ή mechanics πίνακα
    if (role === 'customer') {
      if (!vatNumber || !address) {
        await conn.rollback();
        return res.status(400).json({ error: 'ΑΦΜ και διεύθυνση υποχρεωτικά για πελάτες' });
      }
      await conn.execute(
        'INSERT INTO customers (user_id, vat_number, address, phone) VALUES (?, ?, ?, ?)',
        [userId, vatNumber, address, phone || null]
      );
    } else if (role === 'mechanic') {
      if (!specialty) {
        await conn.rollback();
        return res.status(400).json({ error: 'Ειδικότητα υποχρεωτική για μηχανικούς' });
      }
      await conn.execute(
        'INSERT INTO mechanics (user_id, specialty, phone) VALUES (?, ?, ?)',
        [userId, specialty, phone || null]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Επιτυχής εγγραφή. Περιμένετε έγκριση.' });
  } catch (err) {
    await conn.rollback();
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την εγγραφή' });
  } finally {
    conn.release();
  }
};
