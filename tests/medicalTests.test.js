const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

const uri = "http://127.0.0.1:5000";

describe("Medical Tests API", () => {
  describe("when we issue a 'GET' to /patients/:patientId/medicalTests/:testId", () => {
    it("should return a specific medical test of a patient", (done) => {
      const patientId = "654b237254081faa8c8963c2";
      const testId = "65503dfa573f3e9f0c55ad54";

      chai
        .request(uri)
        .get(`/patients/${patientId}/medicalTests/${testId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");

          done();
        });
    });

    it("should return 404 if patient or medical test ID does not exist", (done) => {
      const nonExistingPatientId = "654b237254081fad8c8963c2"; // Provide a non-existing patient ID
      const nonExistingTestId = "65503dfa573e3e910c55ad54"; // Provide a non-existing medical test ID

      chai
        .request(uri)
        .get(
          `/patients/${nonExistingPatientId}/medicalTests/${nonExistingTestId}`
        )
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});
