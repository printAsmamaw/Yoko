const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
// Patient Routes
router.get('/patients', patientController.getAllPatients); // Get all patients
router.get('/patient/:id', patientController.getPatientById); // Get a specific patient
router.post('/add-patient', patientController.addPatient);


router.get('/patient-history/:id', patientController.getPatientHistory); // Get patient history
router.post('/add-patient-history', patientController.addPatientHistory); // Add to patient history

module.exports = router;
