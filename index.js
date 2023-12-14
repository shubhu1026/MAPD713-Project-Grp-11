let SERVER_NAME = "patient-api";
let PORT = process.env.PORT || 5000;
let HOST = "127.0.0.1";

const patientsRoutes = require("./patientsRoutes");
const testsRoutes = require("./testsRoutes");

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

let errors = require("restify-errors");
let restify = require("restify"),
  // Create the restify server
  server = restify.createServer({ name: SERVER_NAME });

server.listen(PORT, function () {
  console.log("Server %s listening at %s", server.name, server.url);
  console.log("**** Resources: ****");
  console.log("********************");
  console.log(" /Patients");
  console.log(" /Patients/:id");
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

server.get("/", function (req, res, next) {
  try {
    res.send(200, "Server is up and running!");
  } catch (error) {
    console.error("Error in handling the request:", error);
    res.send(500, "Internal Server Error");
  }
});

// Patient Routes
server.get("/patients", patientsRoutes.getAllPatients);
server.get("/patients/:id", patientsRoutes.getSinglePatient);
server.post("/patients", patientsRoutes.addNewPatient);
server.put("/patients/:patientId", patientsRoutes.updatePatient);
server.del("/patients/:id", patientsRoutes.deletePatient);
server.del("/patients", patientsRoutes.deleteAllPatients);
// Get critical patients
server.get("/criticalPatients", patientsRoutes.getCriticalPatients);

//Tests Routes
server.post("/patients/:id/medicalTests", testsRoutes.addNewTest);
server.get(
  "/patients/:patientId/medicalTests/:testId",
  testsRoutes.getSpecificTestOfPatient
);
server.get(
  "/patients/:patientId/medicalTests",
  testsRoutes.getAllTestsOfPatient
);
server.put(
  "/patients/:patientId/medicalTests/:testId",
  testsRoutes.updatePatientTest
);
server.del(
  "/patients/:patientId/medicalTests/:testId",
  testsRoutes.deletePatientTest
);
server.del(
  "/patients/:patientId/medicalTests",
  testsRoutes.deleteAllTestsOfPatient
);
// Get all critical tests for all patients
server.get("/patients/criticalTests", testsRoutes.getAllCriticalTests);
