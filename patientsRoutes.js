const errors = require("restify-errors");
const PatientsModel = require("./PatientsModel");

function getAllPatients(req, res, next) {
  console.log("GET /patients query parameters =>", req.query);
  // Find every entity in db
  PatientsModel.find({})
    .then((Patients) => {
      // Return all of the Patients in the system
      res.send(Patients);
      return next();
    })
    .catch((error) => {
      return next(new Error(JSON.stringify(error.errors)));
    });
}

function getSinglePatient(req, res, next) {
  console.log("GET /patients/:id params=>" + JSON.stringify(req.params));

  // Find a single patient by their id in db
  PatientsModel.findOne({ _id: req.params.id })
    .then((patient) => {
      console.log("found patient: " + patient);
      if (patient) {
        // Send the patient if no issues
        res.send(patient);
      } else {
        // Send 404 header if the patient doesn't exist
        res.send(404);
      }
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
}

function addNewPatient(req, res, next) {
  console.log("POST /Patients params=>" + JSON.stringify(req.params));
  console.log("POST /Patients body=>" + JSON.stringify(req.body));

  // validation of manadatory fields
  if (req.body.firstName === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Name Must Be Provided"));
  }
  if (req.body.lastName === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Name Must Be Provided"));
  }
  if (req.body.address === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Address Must Be Provided"));
  }
  if (req.body.email === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Email Must Be Provided"));
  }
  if (req.body.gender === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Gender Must Be Provided"));
  }
  if (req.body.dateOfBirth === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Date of Birth Must Be Provided"));
  }
  if (req.body.contactNumber === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Contact Number Must Be Provided"));
  }
  if (req.body.doctor === undefined) {
    // If there are any errors, pass them to next in the correct format
    return next(new errors.BadRequestError("Doctor Must Be Provided"));
  }

  let newPatient = new PatientsModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    email: req.body.email,
    gender: req.body.gender,
    doctor: req.body.doctor,
    dateOfBirth: req.body.dateOfBirth,
    contactNumber: req.body.contactNumber,
  });

  // Create the patient and save to db
  newPatient
    .save()
    .then((patient) => {
      console.log("saved patient: " + patient);
      // Send the patient if no issues
      res.send(201, patient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
}

function updatePatient(req, res, next) {
  console.log("PUT /patients/:patientId params =>", req.params);
  console.log("PUT /patients/:patientId body =>", req.body);

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
      }

      // validation of manadatory fields
      if (req.body.firstName === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError("Name Must Be Provided"));
      }
      if (req.body.lastName === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError("Name Must Be Provided"));
      }
      if (req.body.address === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError("Address Must Be Provided"));
      }
      if (req.body.email === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError("Email Must Be Provided"));
      }
      if (req.body.gender === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError("Gender Must Be Provided"));
      }
      if (req.body.dateOfBirth === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(
          new errors.BadRequestError("Date of Birth Must Be Provided")
        );
      }
      if (req.body.contactNumber === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(
          new errors.BadRequestError("Contact Number Must Be Provided")
        );
      }
      if (req.body.doctor === undefined) {
        // If there are any errors, pass them to next in the correct format
        return next(new errors.BadRequestError("Doctor Must Be Provided"));
      }

      // Update patient information based on the request body
      if (req.body.firstName) {
        patient.firstName = req.body.firstName;
      }
      if (req.body.lastName) {
        patient.lastName = req.body.lastName;
      }
      if (req.body.address) {
        patient.address = req.body.address;
      }
      if (req.body.email) {
        patient.email = req.body.email;
      }
      if (req.body.gender) {
        patient.gender = req.body.gender;
      }
      if (req.body.dateOfBirth) {
        patient.dateOfBirth = req.body.dateOfBirth;
      }
      if (req.body.doctor) {
        patient.doctor = req.body.doctor;
      }
      if (req.body.contactNumber) {
        patient.contactNumber = req.body.contactNumber;
      }

      // Save the updated patient data to the database
      return patient.save();
    })
    .then((updatedPatient) => {
      console.log("Updated patient: " + updatedPatient);
      // Send the updated patient data as a response
      res.send(updatedPatient);
      return next();
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(new errors.InternalServerError("Failed to update patient"));
    });
}

function deletePatient(req, res, next) {
  console.log("POST /patients params=>" + JSON.stringify(req.params));
  // Delete the patient in db
  PatientsModel.findOneAndDelete({ _id: req.params.id })
    .then((deletedPatient) => {
      console.log("deleted patient: " + deletedPatient);
      if (deletedPatient) {
        res.send(200, deletedPatient);
      } else {
        res.send(404, "Patient not found");
      }
      return next();
    })
    .catch(() => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
}

function deleteAllPatients(req, res, next) {
  console.log("POST /Patients params=>" + JSON.stringify(req.params));
  // Delete the patient in db
  PatientsModel.deleteMany({})
    .then((deletedPatient) => {
      console.log("deleted patient: " + deletedPatient);
      if (deletedPatient) {
        res.send(200, deletedPatient);
      } else {
        res.send(404, "Patient not found");
      }
      return next();
    })
    .catch(() => {
      console.log("error: " + error);
      return next(new Error(JSON.stringify(error.errors)));
    });
}

function getCriticalPatients(req, res, next) {
  console.log("GET /criticalPatients");

  // Find all patients in the database
  PatientsModel.find({})
    .then((patients) => {
      const criticalPatients = [];

      patients.forEach((patient) => {
        const recentTestsByType = {};

        // Find the most recent test for each test type
        patient.recordHistory.forEach((test) => {
          const testType = test.testType.toLowerCase();

          if (
            !recentTestsByType[testType] ||
            test.date > recentTestsByType[testType].date
          ) {
            recentTestsByType[testType] = test;
          }
        });

        // Check if any of the most recent tests for each type are critical
        const criticalTestTypes = Object.values(recentTestsByType).some(
          (test) => test.condition.toLowerCase() === "critical"
        );

        if (criticalTestTypes) {
          criticalPatients.push(patient);
        }
      });

      // Send the array of critical patients as a response
      res.send(criticalPatients);
    })
    .catch((error) => {
      console.log("error: " + error);
      return next(
        new errors.InternalServerError("Failed to retrieve critical patients")
      );
    });
}

module.exports = {
  getAllPatients,
  getSinglePatient,
  addNewPatient,
  updatePatient,
  deletePatient,
  deleteAllPatients,
  getCriticalPatients,
};
