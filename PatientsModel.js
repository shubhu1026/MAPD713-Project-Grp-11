const mongoose = require("mongoose");

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'patient' collection in the MongoDB databases
const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  email: String,
  gender: String,
  doctor: String,
  dateOfBirth: Date,
  contactNumber: String,
  recordHistory: [
    {
      date: {
        type: Date,
        default: Date.now(),
      },
      diagnosis: String,
      testType: String,
      nurse: String,
      testTime: String,
      category: String,
      readings: String,
      condition: String,
    },
  ],
});

const PatientsModel = mongoose.model("Patients", patientSchema);

module.exports = PatientsModel;
