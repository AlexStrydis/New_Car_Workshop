// backend/src/controllers/appointmentController.js

const pool = require('../config/db');

exports.getAppointments = async (req, res) => {
  const { date, status, customerId } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const size = parseInt(req.query.size, 10) || 10;
  const offset = (page - 1) * size;

  let query = `SELECT * FROM appointment_details WHERE 1=1`;
  const params = [];

  if (req.session.userRole === 'customer') {
    const [ci] = await pool.execute('SELECT id FROM customers WHERE user_id = ?', [req.session.userId]);
    query += ' AND customer_id = ?';
    params.push(ci[0].id);
  } else if (req.session.userRole === 'mechanic') {
    const [mi] = await pool.execute('SELECT id FROM mechanics WHERE user_id = ?', [req.session.userId]);
    query += ' AND mechanic_id = ?';
    params.push(mi[0].id);
  }
  if (date)      { query += ' AND appointment_date = ?';  params.push(date); }
  if (status)    { query += ' AND status = ?';            params.push(status); }
  if (customerId && req.session.userRole === 'secretary') {
    query += ' AND customer_id = ?'; params.push(customerId);
  }

  query += ' ORDER BY appointment_date DESC, appointment_time DESC LIMIT ? OFFSET ?';
  params.push(size, offset);

  try {
    const [appointments] = await pool.execute(query, params);
    res.json({ appointments, page, size });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση ραντεβού' });
  }
};

exports.createAppointment = async (req, res) => {
  const {
    carId,
    appointmentDate,
    appointmentTime,
    reason,
    problemDescription,
    customerId
  } = req.body;

  if (!carId || !appointmentDate || !appointmentTime || !reason) {
    return res.status(400).json({ error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' });
  }
  if (reason === 'repair' && !problemDescription) {
    return res.status(400).json({ error: 'Η περιγραφή προβλήματος είναι υποχρεωτική' });
  }
  const hour = parseInt(appointmentTime.split(':')[0], 10);
  if (hour < 8 || hour >= 16) {
    return res.status(400).json({ error: 'Ωράριο: 08:00 - 16:00' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let cid = customerId;
    if (req.session.userRole === 'customer') {
      const [ci] = await conn.execute('SELECT id FROM customers WHERE user_id = ?', [req.session.userId]);
      cid = ci[0].id;
      const [own] = await conn.execute('SELECT id FROM cars WHERE id = ? AND customer_id = ?', [carId, cid]);
      if (own.length === 0) {
        await conn.rollback();
        return res.status(403).json({ error: 'Το αυτοκίνητο δεν σας ανήκει' });
      }
    }

    const [avail] = await conn.execute(
      `SELECT m.id FROM mechanics m
       WHERE m.id NOT IN (
         SELECT mechanic_id FROM appointments
         WHERE appointment_date = ?
           AND appointment_time >= ?
           AND appointment_time < ADDTIME(?, '02:00:00')
           AND status NOT IN ('cancelled','completed')
       )
       LIMIT 1`,
      [appointmentDate, appointmentTime, appointmentTime]
    );
    if (avail.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'Δεν υπάρχει διαθέσιμος μηχανικός' });
    }
    const mechanicId = avail[0].id;

    const [r] = await conn.execute(
      `INSERT INTO appointments
       (customer_id, car_id, mechanic_id, appointment_date, appointment_time, reason, problem_description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'created')`,
      [cid, carId, mechanicId, appointmentDate, appointmentTime, reason, problemDescription || null]
    );

    await conn.commit();
    res.status(201).json({ id: r.insertId, message: 'Επιτυχής καταχώρηση ραντεβιού' });
  } catch (err) {
    await conn.rollback();
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την καταχώρηση ραντεβιού' });
  } finally {
    conn.release();
  }
};

exports.updateAppointment = async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  const { appointmentDate, appointmentTime, status } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[apt]] = await conn.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (!apt) {
      await conn.rollback();
      return res.status(404).json({ error: 'Το ραντεβιού δεν βρέθηκε' });
    }

    if (req.session.userRole === 'customer') {
      const [ci] = await conn.execute('SELECT id FROM customers WHERE user_id = ?', [req.session.userId]);
      if (apt.customer_id !== ci[0].id) {
        await conn.rollback();
        return res.status(403).json({ error: 'Δεν έχετε δικαίωμα τροποποίησης' });
      }
      if (apt.status !== 'created') {
        await conn.rollback();
        return res.status(400).json({ error: 'Μόνο "created" ραντεβιού μπορεί να τροποποιηθεί' });
      }
    }

    const updates = [];
    const vals = [];

    if (appointmentDate && appointmentTime) {
      const [conf] = await conn.execute(
        `SELECT id FROM appointments
         WHERE mechanic_id = ?
           AND appointment_date = ?
           AND appointment_time >= ?
           AND appointment_time < ADDTIME(?, '02:00:00')
           AND id != ?
           AND status NOT IN ('cancelled','completed')`,
        [apt.mechanic_id, appointmentDate, appointmentTime, appointmentTime, appointmentId]
      );
      if (conf.length > 0) {
        await conn.rollback();
        return res.status(400).json({ error: 'Μη διαθέσιμος μηχανικός' });
      }
      updates.push('appointment_date = ?', 'appointment_time = ?');
      vals.push(appointmentDate, appointmentTime);
    }

    if (status && req.session.userRole === 'secretary') {
      updates.push('status = ?');
      vals.push(status);
    }

    if (updates.length > 0) {
      vals.push(appointmentId);
      await conn.execute(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, vals);
    }

    await conn.commit();
    res.json({ message: 'Επιτυχής ενημέρωση ραντεβιού' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση' });
  } finally {
    conn.release();
  }
};

exports.cancelAppointment = async (req, res) => {
  const appointmentId = parseInt(req.params.id, 10);
  try {
    const [[apt]] = await pool.execute('SELECT * FROM appointments WHERE id = ?', [appointmentId]);
    if (!apt) {
      return res.status(404).json({ error: 'Το ραντεβιού δεν βρέθηκε' });
    }
    if (req.session.userRole === 'customer') {
      const [ci] = await pool.execute('SELECT id FROM customers WHERE user_id = ?', [req.session.userId]);
      if (apt.customer_id !== ci[0].id) {
        return res.status(403).json({ error: 'Δεν έχετε δικαίωμα ακύρωσης' });
      }
    }
    if (['in_progress','completed','cancelled'].includes(apt.status)) {
      return res.status(400).json({ error: 'Δεν μπορεί να ακυρωθεί σε αυτήν την κατάσταση' });
    }
    await pool.execute('UPDATE appointments SET status = ? WHERE id = ?', ['cancelled', appointmentId]);
    res.json({ message: 'Επιτυχής ακύρωση ραντεβιού' });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ακύρωση' });
  }
};
