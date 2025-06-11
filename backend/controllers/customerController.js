// backend/src/controllers/customerController.js

const pool = require('../config/db');

// Helper to escape CSV values
function escapeCsvValue(v) {
  if (v == null) return '';
  const s = v.toString().replace(/"/g, '""');
  return (/[",\n]/.test(s)) ? `"${s}"` : s;
}

exports.exportHistory = async (req, res) => {
  const customerId = parseInt(req.params.id, 10);

  // Authorization: only secretary or the customer themself
  if (req.session.userRole === 'customer') {
    const [[ci]] = await pool.execute(
      'SELECT id,user_id FROM customers WHERE id = ?',
      [customerId]
    );
    if (!ci || ci.user_id !== req.session.userId) {
      return res.status(403).json({ error: 'Δεν έχετε δικαίωμα πρόσβασης' });
    }
  } else if (req.session.userRole !== 'secretary') {
    return res.status(403).json({ error: 'Δεν έχετε δικαίωμα πρόσβασης' });
  }

  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.username, u.first_name, u.last_name, u.email,
        c.vat_number, c.address, c.phone AS customer_phone,
        car.serial_number, car.brand, car.model,
        ap.id AS appointment_id, ap.appointment_date, ap.appointment_time, ap.reason, ap.status,
        w.description AS work_description, w.materials, w.completion_hours, w.cost
      FROM customers c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN cars car ON car.customer_id = c.id
      LEFT JOIN appointments ap ON ap.customer_id = c.id
      LEFT JOIN works w ON w.appointment_id = ap.id
      WHERE c.id = ?
      ORDER BY ap.appointment_date, ap.appointment_time
    `, [customerId]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=customer_${customerId}_history.csv`);

    const header = [
      'username','first_name','last_name','email',
      'vat_number','address','customer_phone',
      'serial_number','brand','model',
      'appointment_id','appointment_date','appointment_time','reason','status',
      'work_description','materials','completion_hours','cost'
    ];
    res.write(header.join(',') + '\n');

    for (const r of rows) {
      const line = header.map(field => escapeCsvValue(r[field]));
      res.write(line.join(',') + '\n');
    }
    res.end();
  } catch (err) {
    console.error('Error exporting history:', err);
    res.status(500).send('Σφάλμα κατά την εξαγωγή ιστορικού');
  }
};
