// backend/src/controllers/carController.js

const pool = require('../src/config/db');
const fs = require('fs');
const csv = require('csv-parser');

// Bulk import cars from CSV
exports.bulkImportCars = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Δεν επιλέχθηκε αρχείο' });
  }
  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', async row => {
      try {
        // Find customer by VAT
        const [cust] = await pool.execute(
          'SELECT id FROM customers WHERE vat_number = ?',
          [row.vatNumber]
        );
        if (cust.length === 0) {
          errors.push(`Δεν βρέθηκε πελάτης ΑΦΜ ${row.vatNumber}`);
          return;
        }
        const customerId = cust[0].id;

        // Insert car
        const [r] = await pool.execute(
          `INSERT IGNORE INTO cars
           (customer_id, serial_number, brand, model, car_type, fuel_type,
            doors_number, wheels_number, production_date, acquisition_year,
            license_plate, mileage)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            customerId,
            row.serialNumber,
            row.brand,
            row.model,
            row.carType,
            row.fuelType,
            row.doorsNumber,
            row.wheelsNumber,
            row.productionDate,
            row.acquisitionYear,
            row.licensePlate || null,
            row.mileage || 0
          ]
        );

        if (r.affectedRows > 0) {
          results.push(`Εισαγωγή α/κ ${row.serialNumber}`);
        } else {
          errors.push(`Υπάρχει ήδη α/κ ${row.serialNumber}`);
        }
      } catch (e) {
        errors.push(`Σφάλμα ${row.serialNumber}: ${e.message}`);
      }
    })
    .on('end', () => {
      fs.unlinkSync(req.file.path);
      res.json({ results, errors });
    });
};

// Get cars (customer sees only their own)
exports.getCars = async (req, res) => {
  let query = `
    SELECT c.*, CONCAT(u.first_name,' ',u.last_name) AS owner_name
    FROM cars c
    JOIN customers cu ON c.customer_id = cu.id
    JOIN users u ON cu.user_id = u.id
  `;
  const params = [];
  if (req.session.userRole === 'customer') {
    query += ' WHERE cu.user_id = ?';
    params.push(req.session.userId);
  }
  try {
    const [cars] = await pool.execute(query, params);
    res.json(cars);
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ανάκτηση αυτοκινήτων' });
  }
};

// Search cars with pagination
exports.searchCars = async (req, res) => {
  const { serialNumber, brand, model, licensePlate } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const size = parseInt(req.query.size, 10) || 10;
  const offset = (page - 1) * size;

  let query = `
    SELECT c.*, CONCAT(u.first_name,' ',u.last_name) AS owner_name
    FROM cars c
    JOIN customers cu ON c.customer_id = cu.id
    JOIN users u ON cu.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (req.session.userRole === 'customer') {
    query += ' AND cu.user_id = ?';
    params.push(req.session.userId);
  }
  if (serialNumber) { query += ' AND c.serial_number LIKE ?'; params.push(`%${serialNumber}%`); }
  if (brand)        { query += ' AND c.brand LIKE ?';         params.push(`%${brand}%`);        }
  if (model)        { query += ' AND c.model LIKE ?';         params.push(`%${model}%`);        }
  if (licensePlate) { query += ' AND c.license_plate LIKE ?';  params.push(`%${licensePlate}%`); }

  query += ' ORDER BY c.id DESC LIMIT ? OFFSET ?';
  params.push(size, offset);

  try {
    const [cars] = await pool.execute(query, params);
    res.json({ cars, page, size });
  } catch (err) {
    console.error('Error searching cars:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την αναζήτηση αυτοκινήτων' });
  }
};

// Create car
exports.createCar = async (req, res) => {
  const {
    serialNumber, brand, model, carType, fuelType,
    doorsNumber, wheelsNumber, productionDate, acquisitionYear,
    licensePlate, mileage, customerId
  } = req.body;

  if (!serialNumber || !brand || !model || !carType || !fuelType ||
      !doorsNumber || !wheelsNumber || !productionDate || !acquisitionYear) {
    return res.status(400).json({ error: 'Όλα τα υποχρεωτικά πεδία πρέπει να συμπληρωθούν' });
  }

  let cid = customerId;
  if (req.session.userRole === 'customer') {
    const [ci] = await pool.execute('SELECT id FROM customers WHERE user_id = ?', [req.session.userId]);
    cid = ci[0].id;
  }

  try {
    const [exist] = await pool.execute('SELECT id FROM cars WHERE serial_number = ?', [serialNumber]);
    if (exist.length > 0) {
      return res.status(400).json({ error: 'Υπάρχει ήδη αυτοκίνητο με αυτόν τον σειριακό αριθμό' });
    }

    const [r] = await pool.execute(
      `INSERT INTO cars
       (customer_id,serial_number,brand,model,car_type,fuel_type,
        doors_number,wheels_number,production_date,acquisition_year,
        license_plate,mileage)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [cid, serialNumber, brand, model, carType, fuelType,
       doorsNumber, wheelsNumber, productionDate, acquisitionYear,
       licensePlate || null, mileage || 0]
    );

    res.status(201).json({ id: r.insertId, message: 'Επιτυχής καταχώρηση αυτοκινήτου' });
  } catch (err) {
    console.error('Error creating car:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την καταχώρηση αυτοκινήτου' });
  }
};

// Update car
exports.updateCar = async (req, res) => {
  const carId = parseInt(req.params.id, 10);
  const updates = req.body;

  try {
    if (req.session.userRole === 'customer') {
      const [owner] = await pool.execute(
        `SELECT c.id FROM cars c
         JOIN customers cu ON c.customer_id = cu.id
         WHERE c.id = ? AND cu.user_id = ?`,
        [carId, req.session.userId]
      );
      if (owner.length === 0) {
        return res.status(403).json({ error: 'Δεν έχετε δικαίωμα τροποποίησης' });
      }
    }

    const allowedFields = [
      'brand','model','car_type','fuel_type',
      'doors_number','wheels_number',
      'production_date','acquisition_year',
      'license_plate','mileage'
    ];
    const fields = [];
    const vals = [];
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        vals.push(updates[key]);
      }
    });
    if (!fields.length) {
      return res.status(400).json({ error: 'Δεν υπάρχουν έγκυρα πεδία για ενημέρωση' });
    }
    vals.push(carId);
    await pool.execute(`UPDATE cars SET ${fields.join(', ')} WHERE id = ?`, vals);

    res.json({ message: 'Επιτυχής ενημέρωση αυτοκινήτου' });
  } catch (err) {
    console.error('Error updating car:', err);
    res.status(500).json({ error: 'Σφάλμα κατά την ενημέρωση αυτοκινήτου' });
  }
};

// Delete car
exports.deleteCar = async (req, res) => {
  const carId = parseInt(req.params.id, 10);

  try {
    if (req.session.userRole === 'customer') {
      const [owner] = await pool.execute(
        `SELECT c.id FROM cars c
         JOIN customers cu ON c.customer_id = cu.id
         WHERE c.id = ? AND cu.user_id = ?`,
        [carId, req.session.userId]
      );
      if (owner.length === 0) {
        return res.status(403).json({ error: 'Δεν έχετε δικαίωμα διαγραφής' });
      }
    }

    await pool.execute('DELETE FROM cars WHERE id = ?', [carId]);
    res.json({ message: 'Επιτυχής διαγραφή αυτοκινήτου' });
  } catch (err) {
    console.error('Error deleting car:', err);
    res.status(500).json({ error: 'Σφάλμα κατά τη διαγραφή αυτοκινήτου' });
  }
};
