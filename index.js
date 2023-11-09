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
