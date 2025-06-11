// backend/src/controllers/workController.js

const pool = require('../config/db');

exports.addWork = async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { description, materials, completionHours, cost } = req.body;

  // Validation
  if (!description || !materials || !completionHours || !cost) {
    return res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά' });
  }

  try {
    // Έλεγχος ότι το ραντεβού υπάρχει
    const [[apt]] = await pool.execute(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    if (!apt) {
      return res.status(404).json({ error: 'Το ραντεβού δεν βρέθηκε' });
    }

    // Έλεγχος δικαιωμάτων: μηχανικός το δικό του, γραμματέας οποιοδήποτε
    if (req.session.userRole === 'mechanic') {
      const [mi] = await pool.execute(
        'SELECT id FROM mechanics WHERE user_id = ?',
        [req.session.userId]
      );
      if (apt.mechanic_id !== mi[0].id) {
        return res.status(403).json({ error: 'Δεν έχετε δικαίωμα προσθήκης εργασιών' });
      }
    } else if (req.session.userRole !== 'secretary') {
      return res.status(403).json({ error: 'Δεν έχετε δικαίωμα προσθήκης εργασιών' });
    }

    // Μόνο σε ραντεβού σε εξέλιξη
    if (apt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Εργασίες επιτρέπονται μόνο σε ραντεβού "in_progress"' });
    }

    // Εισαγωγή εργασίας
    const [r] = await pool.execute(
      `INSERT INTO works
       (appointment_id, description, materials, completion_hours, cost)
       VALUES (?, ?, ?, ?, ?)`,
      [appointmentId, description, materials, completionHours, cost]
    );

    res.status(201).json({ id: r.insertId, message: 'Επιτυχής προσθήκη εργασίας' });
  } catch (err) {
    console.error('Error adding work:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την προσθήκη εργασίας' });
  }
};

exports.getWorks = async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);

  try {
    const [works] = await pool.execute(
      'SELECT * FROM works WHERE appointment_id = ? ORDER BY created_at',
      [appointmentId]
    );
    res.json(works);
  } catch (err) {
    console.error('Error fetching works:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση εργασιών' });
  }
};
