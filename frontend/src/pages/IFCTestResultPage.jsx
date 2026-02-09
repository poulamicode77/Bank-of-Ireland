import React, { useState } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function IFCTestResultPage() {
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState([]);

  const testData = {
    controlId: "CTRL-12345",
    sampleRef: "AS04_MOET2A_2024",
    workPaperRef: "WP-2024-07",
    method: "Walkthrough and substantive testing",
    population: "Jan–Jun 2024",
    sampleSize: "10",
    testSample: "3 selected transactions",
    testDate: "15 July 2024",
    attributes: [
      {
        id: 1,
        work: "Verified double entry postings.",
        exceptions: "None noted."
      },
      {
        id: 2,
        work: "Checked reconciliation against retirement benefit obligation.",
        exceptions: "One mismatch in transaction type 426."
      },
      {
        id: 3,
        work: "Reviewed supporting documentation.",
        exceptions: "Documentation incomplete for one sample."
      }
    ],
    conclusion: "Control is partially effective.",
    rationale: "Exceptions noted in Attribute 2 and 3 reduce effectiveness."
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("IFC Test Result", 10, 10);
    doc.text(`Control ID: ${testData.controlId}`, 10, 20);
    doc.text(`Sample Ref: ${testData.sampleRef}`, 10, 30);
    doc.text(`WorkPaper Ref: ${testData.workPaperRef}`, 10, 40);
    doc.text(`Conclusion: ${testData.conclusion}`, 10, 50);
    doc.text(`Rationale: ${testData.rationale}`, 10, 60);
    doc.save("IFC_Test_Result.pdf");
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        ControlID: testData.controlId,
        SampleRef: testData.sampleRef,
        WorkPaperRef: testData.workPaperRef,
        Conclusion: testData.conclusion,
        Rationale: testData.rationale
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "IFC Result");
    XLSX.writeFile(wb, "IFC_Test_Result.xlsx");
  };

  const handleSendChat = () => {
    if (chatInput.trim() === "") return;
    setChatLog([...chatLog, { sender: "You", message: chatInput }]);
    setChatInput("");
    // Later: send to AI backend
  };

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h3 className="mb-4">IFC Test Result</h3>

        <div className="mb-3">
          <h5>Tester Summary of Work</h5>
          <p>Control ID: {testData.controlId}</p>
          <p>Test Sample Ref: {testData.sampleRef}</p>
          <p>WorkPaper Reference: {testData.workPaperRef}</p>
        </div>

        <div className="mb-3">
          <h5>Testing Method</h5>
          <p>{testData.method}</p>
        </div>

        <div className="mb-3">
          <h5>Sample Details</h5>
          <p>Sample Population: {testData.population}</p>
          <p>Sample Size: {testData.sampleSize}</p>
          <p>Test Sample: {testData.testSample}</p>
          <p>Test Date: {testData.testDate}</p>
        </div>

        <div className="mb-3">
          <h5>Attributes</h5>
          {testData.attributes.map((attr) => (
            <div className="border rounded p-3 mb-3" key={attr.id}>
              <h6>Attribute {attr.id}</h6>
              <p><strong>Detail of Work Undertaken:</strong> {attr.work}</p>
              <p><strong>Exceptions:</strong> {attr.exceptions}</p>
            </div>
          ))}
        </div>

        <div className="mb-3">
          <h5>Test Conclusion</h5>
          <p>{testData.conclusion}</p>
          <p><strong>Rationale:</strong> {testData.rationale}</p>
        </div>

        <div className="d-flex justify-content-between mt-4">
          <button className="btn btn-outline-secondary" onClick={handleExportPDF}>
            Export to PDF
          </button>
          <button className="btn btn-outline-secondary" onClick={handleExportExcel}>
            Export to Excel
          </button>
        </div>

        <div className="mt-4 border rounded p-3 bg-light">
          <h6>Embedded Chat</h6>
          <div className="mb-2" style={{ maxHeight: "150px", overflowY: "auto" }}>
            {chatLog.map((entry, idx) => (
              <p key={idx}><strong>{entry.sender}:</strong> {entry.message}</p>
            ))}
          </div>
          <textarea
            className="form-control mb-2"
            rows="3"
            placeholder="Type your question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          ></textarea>
          <button className="btn btn-primary" onClick={handleSendChat}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default IFCTestResultPage;
