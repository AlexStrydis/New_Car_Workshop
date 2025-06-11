// backend/src/controllers/statsController.js

const pool = require('../src/config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {};

    if (req.session.userRole === 'secretary') {
      const [[today]]     = await pool.execute('SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = CURDATE()');
      const [[completed]] = await pool.execute('SELECT COUNT(*) AS count FROM appointments WHERE status = "completed"');
      const [[inProg]]    = await pool.execute('SELECT COUNT(*) AS count FROM appointments WHERE status = "in_progress"');
      const [[totCust]]   = await pool.execute('SELECT COUNT(*) AS count FROM customers');
      stats.todayAppointments      = today.count;
      stats.completedAppointments  = completed.count;
      stats.inProgressAppointments = inProg.count;
      stats.totalCustomers         = totCust.count;

    } else if (req.session.userRole === 'mechanic') {
      const [[mi]]     = await pool.execute('SELECT id FROM mechanics WHERE user_id = ?', [req.session.userId]);
      const [[sched]]  = await pool.execute(
        'SELECT COUNT(*) AS count FROM appointments WHERE mechanic_id = ? AND status = "created"',
        [mi.id]
      );
      const [[inProg]] = await pool.execute(
        'SELECT COUNT(*) AS count FROM appointments WHERE mechanic_id = ? AND status = "in_progress"',
        [mi.id]
      );
      const [[comp]]   = await pool.execute(
        'SELECT COUNT(*) AS count FROM appointments WHERE mechanic_id = ? AND status = "completed"',
        [mi.id]
      );
      stats.scheduledAppointments  = sched.count;
      stats.inProgressAppointments = inProg.count;
      stats.completedAppointments  = comp.count;

    } else if (req.session.userRole === 'customer') {
      const [[ci]]     = await pool.execute('SELECT id FROM customers WHERE user_id = ?', [req.session.userId]);
      const [[nextA]]  = await pool.execute(
        'SELECT COUNT(*) AS count FROM appointments WHERE customer_id = ? AND status = "created"',
        [ci.id]
      );
      const [[inProg]] = await pool.execute(
        'SELECT COUNT(*) AS count FROM appointments WHERE customer_id = ? AND status = "in_progress"',
        [ci.id]
      );
      const [[myCars]] = await pool.execute(
        'SELECT COUNT(*) AS count FROM cars WHERE customer_id = ?',
        [ci.id]
      );
      const [[comp]]   = await pool.execute(
        'SELECT COUNT(*) AS count FROM appointments WHERE customer_id = ? AND status = "completed"',
        [ci.id]
      );
      stats.nextAppointments       = nextA.count;
      stats.inProgressAppointments = inProg.count;
      stats.totalCars              = myCars.count;
      stats.completedAppointments  = comp.count;
    }

    res.json(stats);
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση στατιστικών' });
  }
};
