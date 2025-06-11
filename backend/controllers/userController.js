// backend/src/controllers/userController.js

const pool = require('../config/db');
const bcrypt = require('bcrypt');
const fs = require('fs');
const csv = require('csv-parser');

// Bulk import users from CSV
exports.bulkImportUsers = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Δεν επιλέχθηκε αρχείο' });
  }
  const results = [];
  const errors = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', async row => {
      try {
        const hashed = await bcrypt.hash(row.password || 'default123', 10);
        const [r] = await pool.execute(
          `INSERT IGNORE INTO users
           (username,password,email,first_name,last_name,identity_number,role,is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, FALSE)`,
          [
            row.username,
            hashed,
            row.email,
            row.firstName,
            row.lastName,
            row.identityNumber,
            row.role
          ]
        );
        if (r.affectedRows > 0) {
          results.push(`Εισαγωγή: ${row.username}`);
        } else {
          errors.push(`Υπάρχει ήδη: ${row.username}`);
        }
      } catch (e) {
        errors.push(`Σφάλμα ${row.username}: ${e.message}`);
      }
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json({ results, errors });
    });
};

// Get all users (secretary only)
exports.getUsers = async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT 
        u.*,
        c.id   AS customer_id,
        c.vat_number,
        c.address      AS customer_address,
        c.phone        AS customer_phone,
        m.specialty,
        m.phone        AS mechanic_phone
      FROM users u
      LEFT JOIN customers c ON u.id = c.user_id
      LEFT JOIN mechanics m ON u.id = m.user_id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση χρηστών' });
  }
};

// Search users with pagination (secretary only)
exports.searchUsers = async (req, res) => {
  const { username, lastName, vatNumber } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const size = parseInt(req.query.size, 10) || 10;
  const offset = (page - 1) * size;

  let query = `
    SELECT u.*, c.id AS customer_id, c.vat_number, c.address, c.phone
    FROM users u
    LEFT JOIN customers c ON u.id = c.user_id
    WHERE 1=1
  `;
  const params = [];
  if (username)  { query += ' AND u.username LIKE ?'; params.push(`%${username}%`); }
  if (lastName)  { query += ' AND u.last_name LIKE ?'; params.push(`%${lastName}%`); }
  if (vatNumber) { query += ' AND c.vat_number = ?';    params.push(vatNumber);        }

  query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
  params.push(size, offset);

  try {
    const [users] = await pool.execute(query, params);
    res.json({ users, page, size });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την αναζήτηση χρηστών' });
  }
};

// Update user (self or secretary)
exports.updateUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updates = req.body;

  if (req.session.userRole !== 'secretary' && req.session.userId !== userId) {
    return res.status(403).json({ error: 'Δεν έχετε δικαίωμα τροποποίησης' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update users table
    const userUpd = {};
    if (updates.email)      userUpd.email      = updates.email;
    if (updates.firstName)  userUpd.first_name = updates.firstName;
    if (updates.lastName)   userUpd.last_name  = updates.lastName;
    if (req.session.userRole === 'secretary' && updates.isActive !== undefined) {
      userUpd.is_active = updates.isActive;
    }
    if (Object.keys(userUpd).length > 0) {
      const setC = Object.keys(userUpd).map(k => `${k} = ?`).join(', ');
      await conn.execute(
        `UPDATE users SET ${setC} WHERE id = ?`,
        [...Object.values(userUpd), userId]
      );
    }

    // Update customers/mechanics if needed
    const [[info]] = await conn.execute('SELECT role FROM users WHERE id = ?', [userId]);
    if (info.role === 'customer' && (updates.vatNumber || updates.address || updates.phone)) {
      await conn.execute(
        'UPDATE customers SET vat_number = ?, address = ?, phone = ? WHERE user_id = ?',
        [updates.vatNumber, updates.address, updates.phone, userId]
      );
    } else if (info.role === 'mechanic' && (updates.specialty || updates.phone)) {
      await conn.execute(
        'UPDATE mechanics SET specialty = ?, phone = ? WHERE user_id = ?',
        [updates.specialty, updates.phone, userId]
      );
    }

    await conn.commit();
    res.json({ message: 'Επιτυχής ενημέρωση στοιχείων' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση χρήστη' });
  } finally {
    conn.release();
  }
};

// Delete user (self or secretary)
exports.deleteUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (req.session.userRole !== 'secretary' && req.session.userId !== userId) {
    return res.status(403).json({ error: 'Δεν έχετε δικαίωμα διαγραφής' });
  }

  try {
    await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
    if (req.session.userId === userId) req.session.destroy();
    res.json({ message: 'Επιτυχής διαγραφή χρήστη' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή χρήστη' });
  }
};
