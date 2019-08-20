import { Selector } from "testcafe";
import { readFileSync } from "fs";
import { join } from "path";
import { getData } from "@govtechsg/open-attestation";

fixture("Singapore Management University").page`http://localhost:3000`;

const Certificate = "./transcript.opencert";

const RenderedCertificate = Selector("#rendered-certificate");

const validateTextContent = async (t, component, texts) =>
  texts.reduce(
    async (prev, curr) => t.expect(component.textContent).contains(curr),
    Promise.resolve()
  );

test("Transcript is rendered correctly", async t => {
  // Inject javascript and execute window.opencerts.renderDocument
  const certificateContent = getData(
    JSON.parse(readFileSync(join(__dirname, Certificate)).toString())
  );
  await t.eval(() => window.opencerts.renderDocument(certificateContent), {
    dependencies: { certificateContent }
  });

  // Check content of window.opencerts.templates
  await t.wait(500);
  const templates = await t.eval(() => window.opencerts.getTemplates());
  await t
    .expect(templates)
    .eql([{ id: "transcript", label: "Transcript", template: undefined }]);

  // Certificate tab content
  await validateTextContent(t, RenderedCertificate, [
    "Name: AHSUMMUIQAHALLIDAF NIB MIQATSU",
    "Date of Enrolment: 15 Aug 2011",
    "Date of Birth: 11 Sep 1989",
    "Student ID No: 01234851",
    "Date of Issue: 20 AUG 2019",
    "Serial Number: 201510926"
  ]);
});
