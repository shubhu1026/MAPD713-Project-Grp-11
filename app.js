const restify = require("restify");
const mongoose = require("mongoose");

const server = restify.createServer();

// MongoDB connection setup
mongoose.connect(uristring, { useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB!");
});

server.use(restify.plugins.fullResponse());
server.use(restify.plugins.bodyParser());

// Require and use routes
const patientRoutes = require("./routes/patientRoutes");
const medicalTestRoutes = require("./routes/medicalTestRoutes");

patientRoutes.applyRoutes(server);
medicalTestRoutes.applyRoutes(server);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

server.listen(PORT, HOST, function () {
  console.log(`Server is running at ${HOST}:${PORT}`);
});
