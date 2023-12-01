const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

const uri = "http://127.0.0.1:5000";

describe("Patients API", () => {
  describe("when we issue a 'GET' to /patients", () => {
    it("should return patients with the correct structure", (done) => {
      chai
        .request(uri)
        .get("/patients")
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an("array");

          if (res.body.length > 0) {
            const examplePatient = {
              _id: "",
              firstName: "",
              lastName: "",
              address: "",
              email: "",
              gender: "",
              dateOfBirth: "",
              contactNumber: "",
              recordHistory: [
                {
                  date: "",
                  diagnosis: "",
                  testType: "",
                  nurse: "",
                  testTime: "",
                  category: "",
                  readings: "",
                  condition: "",
                  _id: "",
                },
              ],
              __v: 0,
              doctor: "",
            };

            // Check the structure of the first patient in the response
            const firstPatient = res.body[0];

            expect(firstPatient).to.have.all.keys(Object.keys(examplePatient));
            expect(firstPatient.recordHistory).to.be.an("array");
            expect(firstPatient.recordHistory[0]).to.have.all.keys(
              Object.keys(examplePatient.recordHistory[0])
            );
          }

          done();
        });
    });
  });

  describe("when we issue a 'GET' to /patients/:id", () => {
    it("should return a specific patient by ID", (done) => {
      const patientId = "654b237254081faa8c8963c2";
      chai
        .request(uri)
        .get(`/patients/${patientId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");

          const examplePatientStructure = {
            _id: "",
            firstName: "",
            lastName: "",
            address: "",
            email: "",
            gender: "",
            dateOfBirth: "",
            contactNumber: "",
            recordHistory: [
              {
                date: "",
                diagnosis: "",
                testType: "",
                nurse: "",
                testTime: "",
                category: "",
                readings: "",
                condition: "",
                _id: "",
              },
            ],
            __v: 0,
            doctor: "",
          };

          // Check the structure of the retrieved patient
          expect(res.body).to.have.all.keys(
            Object.keys(examplePatientStructure)
          );
          expect(res.body.recordHistory).to.be.an("array");
          if (res.body.recordHistory.length > 0) {
            expect(res.body.recordHistory[0]).to.have.all.keys(
              Object.keys(examplePatientStructure.recordHistory[0])
            );
          }

          done();
        });
    });

    it("should return 404 if patient ID does not exist", (done) => {
      const nonExistingPatientId = "654b238154082faa8c8963c5";

      chai
        .request(uri)
        .get(`/patients/${nonExistingPatientId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("when we issue a 'PUT' to /patients/:patientId", () => {
    it("should update a specific patient by ID", (done) => {
      const patientIdToUpdate = "654b238154081faa8c8963c4";

      const updatedPatientData = {
        firstName: "Bob(New)",
        lastName: "Smith(New)",
      };

      chai
        .request(uri)
        .put(`/patients/${patientIdToUpdate}`)
        .send(updatedPatientData)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");

          done();
        });
    });
  });
});
