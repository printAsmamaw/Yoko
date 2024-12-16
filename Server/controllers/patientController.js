const db = require('../config/db'); 

// Get all patients
exports.getAllPatients = (req, res) => {
  const query = `
    SELECT * FROM patients
    ORDER BY created_at DESC;
  `;
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patients' });
    }

    res.status(200).json(results);
  });
};

// Get a patient by ID
exports.getPatientById = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT * FROM patients WHERE id = ?;
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.status(200).json(results[0]);
  });
};

// Add a new patient
exports.addPatient = (req, res) => {
    const {
      mrn,
      date_reg,
      name,
      fname,
      gfname,
      sex,
      date_birth,
      age,
      region,
      woreda,
      gott,
      kebele,
      house_number,
      phone,
    } = req.body;
  
    // Validate required fields
    if (!mrn || !date_reg || !name || !fname || !sex || !date_birth) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
  
    const query = `
      INSERT INTO patients (mrn, date_reg, name, fname, gfname, sex, date_birth, age, region, woreda, gott, kebele, house_number, phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    const params = [mrn, date_reg, name, fname, gfname, sex, date_birth, age, region, woreda, gott, kebele, house_number, phone];
  
    db.query(query, params, (err, results) => {
      if (err) {
        console.error('Error inserting patient:', err);
        return res.status(500).json({ error: 'Failed to add patient to the database' });
      }
      res.status(201).json({ message: 'Patient added successfully', patientId: results.insertId });
    });
  };
  
  
// Get patient history
exports.getPatientHistory = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT * FROM patient_records WHERE patient_id = ? ORDER BY created_at DESC;
  `;
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient history' });
    }
    res.status(200).json(results);
  });
};

// Add to patient history
exports.addPatientHistory = (req, res) => {
  const { patient_id, visit_date, diagnosis, treatment, doctor_name, notes } = req.body;

  const query = `
    INSERT INTO patient_records (patient_id, visit_date, diagnosis, treatment, doctor_name, notes)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  db.query(query, [patient_id, visit_date, diagnosis, treatment, doctor_name, notes], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to add patient history' });
    }
    res.status(200).json({ message: 'Patient history added successfully', recordId: results.insertId });
  });
};
