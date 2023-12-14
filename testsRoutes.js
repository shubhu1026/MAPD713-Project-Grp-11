const errors = require("restify-errors");
const PatientsModel = require("./PatientsModel");

function convertTestTimeToDate(testTime, testDate) {
  // Split the test time string into hours, minutes, and AM/PM parts
  const [time, meridian] = testTime.split(" ");
  const [hours, minutes] = time.split(".");

  // Convert hours to 24-hour format
  let hourValue = parseInt(hours, 10);
  if (meridian === "PM" && hourValue !== 12) {
    hourValue += 12;
  } else if (meridian === "AM" && hourValue === 12) {
    hourValue = 0;
  }

  // Create a new date object using the provided testDate and set the hours and minutes
  const currentDate = new Date(testDate);
  currentDate.setHours(hourValue, parseInt(minutes, 10), 0, 0);

  return currentDate;
}

function addNewTest(req, res, next) {
  console.log(
    "POST /patients/:id/medicalTests params=>" + JSON.stringify(req.params)
  );
  console.log(
    "POST /patients/:id/medicalTests body=>" + JSON.stringify(req.body)
  );

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.id })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // Validate and extract the medical record data from the request body
      const {
        date,
        diagnosis,
        testType,
        nurse,
        testTime,
        category,
        readings,
        condition,
      } = req.body;

      const testDate = new Date(date); // Replace this with the desired date
      const convertedTestTime = convertTestTimeToDate(testTime, testDate);

      // Check if the required fields are present in the request body
      if (
        !date ||
        !diagnosis ||
        !testType ||
        !nurse ||
        !testTime ||
        !readings
      ) {
        return next(new errors.BadRequestError("Required fields are missing"));
      }

      // Parse the readings as a float
      const parsedReadings = parseFloat(readings);

      // Check if readings input is valid
      if (isNaN(parsedReadings)) {
        return next(new errors.BadRequestError("Readings must be a number"));
      }

      let newCondition = condition || "";

      // Set the condition based on test type and readings
      switch (testType.toLowerCase()) {
        case "blood pressure test":
          const bpReadings = parseFloat(readings);
          if (bpReadings < 90 || bpReadings > 140) {
            newCondition = "Critical";
          } else {
            newCondition = "Normal";
          }
          break;
        case "blood sugar test":
          const sugarReadings = parseFloat(readings);
          if (sugarReadings < 80 || sugarReadings > 180) {
            newCondition = "Critical";
          } else {
            newCondition = "Normal";
          }
          break;
        case "cholesterol test":
          const cholesterolReadings = parseFloat(readings);
          if (cholesterolReadings > 240) {
            newCondition = "Critical";
          } else {
            newCondition = "Normal";
          }
          break;
        case "complete blood count (cbc)":
          const cbcReadings = parseFloat(readings);
          if (cbcReadings < 4.5 || cbcReadings > 10) {
            newCondition = "Critical";
          } else {
            newCondition = "Healthy";
          }
          break;
        default:
          break;
      }

      // Create a new medical record object with the updated condition
      const newMedicalRecord = {
        date: testDate,
        diagnosis,
        testType,
        nurse,
        testTime: convertedTestTime,
        category,
        readings,
        condition: newCondition,
      };

      // Add the new medical record to the patient's recordHistory
      patient.recordHistory.push(newMedicalRecord);

      // Save the updated patient data to the database
      return patient.save();
    })
    .then((updatedPatient) => {
      console.log("Added medical record to patient: " + updatedPatient);

      // Send the updated patient data as a response
      res.send(updatedPatient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to add medical record")
      );
    });
}

function getSpecificTestOfPatient(req, res, next) {
  console.log(
    "GET /patients/:patientId/medicalTests/:testId params =>",
    req.params
  );

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // Find the specific medical test by its ID
      const medicalTest = patient.recordHistory.id(req.params.testId);

      if (!medicalTest) {
        return next(new errors.NotFoundError("Medical test not found"));
      }

      // Send the details of the specific medical test as a response
      return res.send(medicalTest); // Return the response directly
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError(
          "Failed to retrieve medical test details"
        )
      );
    });
}

function getAllTestsOfPatient(req, res, next) {
  console.log("GET /patients/:patientId/medicalTests params =>", req.params);

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // Retrieve all the medical tests from the patient's recordHistory
      const medicalTests = patient.recordHistory;

      // Send the array of medical tests as a response
      res.send(medicalTests);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to retrieve medical tests")
      );
    });
}

function updatePatientTest(req, res, next) {
  console.log(
    "PUT /patients/:patientId/medicalTests/:testId params =>",
    req.params
  );
  console.log(
    "PUT /patients/:patientId/medicalTests/:testId body =>",
    req.body
  );

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // Find the specific medical test by its ID
      const medicalTest = patient.recordHistory.id(req.params.testId);

      if (!medicalTest) {
        return next(new errors.NotFoundError("Medical test not found"));
      }

      // Validate and update the specific medical test with the data from the request body
      const {
        date,
        diagnosis,
        testType,
        nurse,
        testTime,
        category,
        readings,
        condition,
      } = req.body;

      // Check if the required fields are present in the request body
      if (
        !date ||
        !diagnosis ||
        !testType ||
        !nurse ||
        !testTime ||
        !readings
      ) {
        return next(new errors.BadRequestError("Required fields are missing"));
      }

      // Parse the readings as a float
      const parsedReadings = parseFloat(readings);

      // Check if readings input is valid
      if (isNaN(parsedReadings)) {
        return next(new errors.BadRequestError("Readings must be a number"));
      }

      let newCondition = condition || "";

      // Set the condition based on test type and readings
      switch (testType.toLowerCase()) {
        case "blood pressure test":
          if (parsedReadings < 90 || parsedReadings > 140) {
            newCondition = "Critical";
          } else {
            newCondition = "Normal";
          }
          break;
        case "blood sugar test":
          if (parsedReadings < 80 || parsedReadings > 180) {
            newCondition = "Critical";
          } else {
            newCondition = "Normal";
          }
          break;
        case "cholesterol test":
          if (parsedReadings > 240) {
            newCondition = "Critical";
          } else {
            newCondition = "Normal";
          }
          break;
        case "complete blood count (cbc)":
          if (parsedReadings < 4.5 || parsedReadings > 10) {
            newCondition = "Critical";
          } else {
            newCondition = "Healthy";
          }
          break;
        default:
          break;
      }

      // Update the specific medical test
      medicalTest.date = date;
      medicalTest.diagnosis = diagnosis;
      medicalTest.testType = testType;
      medicalTest.nurse = nurse;
      medicalTest.testTime = testTime;
      medicalTest.category = category;
      medicalTest.readings = readings;
      medicalTest.condition = newCondition;

      // Save the updated patient data to the database
      return patient.save();
    })
    .then((updatedPatient) => {
      console.log("Updated medical test for patient: " + updatedPatient);
      // Send the updated patient data as a response
      res.send(updatedPatient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to update medical test")
      );
    });
}

function deletePatientTest(req, res, next) {
  console.log(
    "DELETE /patients/:patientId/medicalTests/:testId params =>",
    req.params
  );

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // Find the specific medical test by its ID
      const medicalTest = patient.recordHistory.id(req.params.testId);

      if (!medicalTest) {
        return next(new errors.NotFoundError("Medical test not found"));
      }

      // Remove the specific medical test from the patient's recordHistory
      patient.recordHistory.pull(medicalTest);

      // Save the updated patient data to the database
      return patient.save();
    })
    .then((updatedPatient) => {
      console.log("Deleted medical test for patient: " + updatedPatient);
      // Send the updated patient data as a response
      res.send(updatedPatient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to delete medical test")
      );
    });
}

function deleteAllTestsOfPatient(req, res, next) {
  console.log("DELETE /patients/:patientId/medicalTests params =>", req.params);

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // Remove all medical tests from the patient's recordHistory
      patient.recordHistory = [];

      // Save the updated patient data to the database
      return patient.save();
    })
    .then((updatedPatient) => {
      console.log("Deleted all medical tests for patient: " + updatedPatient);
      // Send the updated patient data as a response
      res.send(updatedPatient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to delete all medical tests")
      );
    });
}

function getAllCriticalTests(req, res, next) {
  console.log("GET /criticalTests");

  // Find all patients in the database
  PatientsModel.find({})
    .then((patients) => {
      const allCriticalTests = [];

      // Iterate through all patients
      patients.forEach((patient) => {
        // Filter the medical tests in the patient's recordHistory where the condition is critical
        const criticalTests = patient.recordHistory.filter(
          (test) => test.condition.toLowerCase() === "critical"
        );

        // Add the critical tests for this patient to the allCriticalTests array
        allCriticalTests.push({
          patientId: patient._id,
          criticalTests,
        });
      });

      // Send the array of critical tests for all patients as a response
      res.send(allCriticalTests);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to retrieve critical tests")
      );
    });
}

module.exports = {
  addNewTest,
  getSpecificTestOfPatient,
  getAllTestsOfPatient,
  updatePatientTest,
  deletePatientTest,
  deleteAllTestsOfPatient,
  getAllCriticalTests,
};
