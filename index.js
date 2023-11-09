let SERVER_NAME = "patient-api";
let PORT = 5000;
let HOST = "127.0.0.1";

const mongoose = require("mongoose");
const username = "anmolsharma55555";
const password = "test123";
const dbname = "Cluster0";
// Atlas MongoDb connection string format
let uristring =
  "mongodb+srv://" +
  username +
  ":" +
  password +
  "@cluster0.in1scsy.mongodb.net/?retryWrites=true&w=majority";

// Makes db connection asynchronously
mongoose.connect(uristring, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  // we're connected!
  console.log("!!!! Connected to db: " + uristring);
});

const patientSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  email: String,
  gender: String,
  dateOfBirth: String,
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

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'patient' collection in the MongoDB database
let PatientsModel = mongoose.model("Patients", patientSchema);

let errors = require("restify-errors");
let restify = require("restify"),
  // Create the restify server
  server = restify.createServer({ name: SERVER_NAME });

server.listen(PORT, HOST, function () {
  console.log("Server %s listening at %s", server.name, server.url);
  console.log("**** Resources: ****");
  console.log("********************");
  console.log(" /Patients");
  console.log(" /Patients/:id");
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Get all Patients in the system
server.get("/patients", function (req, res, next) {
  // You can access individual query parameters like this:
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
});

// Get a single patient by their patient id
server.get("/patients/:id", function (req, res, next) {
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
});

// Create a new patient
server.post("/patients", function (req, res, next) {
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

  let newPatient = new PatientsModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    email: req.body.email,
    gender: req.body.gender,
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
});

server.put("/patients/:patientId", function (req, res, next) {
  console.log("PUT /patients/:patientId params =>", req.params);
  console.log("PUT /patients/:patientId body =>", req.body);

  // Find the patient by their ID
  PatientsModel.findOne({ _id: req.params.patientId })
    .then((patient) => {
      if (!patient) {
        return next(new errors.NotFoundError("Patient not found"));
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
});

// Delete patient with the given id
server.del("/patients/:id", function (req, res, next) {
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
});

// Delete all patients
server.del("/patients", function (req, res, next) {
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
});

// add a medical test for a patient
server.post("/patients/:id/medicalTests", function (req, res, next) {
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

      // Create a new medical record object
      const newMedicalRecord = {
        date: date || new Date(),
        diagnosis,
        testType,
        nurse,
        testTime,
        category,
        readings,
        condition,
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
});

// get a specific test of a patient
server.get(
  "/patients/:patientId/medicalTests/:testId",
  function (req, res, next) {
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
        res.send(medicalTest);
        return next();
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
);

// get all tests of a patient
server.get("/patients/:patientId/medicalTests", function (req, res, next) {
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
});

// update a test of a patient
server.put(
  "/patients/:patientId/medicalTests/:testId",
  function (req, res, next) {
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

        // Update the specific medical test with the data from the request body
        medicalTest.set(req.body);

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
);

// delete a test of a patient
server.del(
  "/patients/:patientId/medicalTests/:testId",
  function (req, res, next) {
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
);

// delete all tests of a patient
server.del("/patients/:patientId/medicalTests", function (req, res, next) {
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
});
