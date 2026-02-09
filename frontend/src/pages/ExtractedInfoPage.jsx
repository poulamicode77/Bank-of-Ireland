import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExtractedInfoPage() {
  const [progressBars, setProgressBars] = useState([0, 0, 0, 0]);
  const [running, setRunning] = useState(false);
  const navigate = useNavigate();

  const handleBeginAssessment = () => {
    setRunning(true);
    const intervals = progressBars.map((_, idx) => {
      let value = 0;
      return setInterval(() => {
        value += Math.floor(Math.random() * 20) + 10; // random increments
        if (value >= 100) {
          value = 100;
          clearInterval(intervals[idx]);
        }
        setProgressBars((prev) => {
          const updated = [...prev];
          updated[idx] = value;
          return updated;
        });
      }, 600);
    });
  };

  // Watch progress bars: when all hit 100, navigate to results page
  useEffect(() => {
    if (running && progressBars.every((val) => val === 100)) {
      // small delay so user sees completion
      setTimeout(() => navigate("/ifc-test-result"), 1000);
    }
  }, [progressBars, running, navigate]);

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h3 className="mb-4">Extracted Information</h3>

        <div className="mb-3">
          <h5>Summary of Context of IFC</h5>
          <p>Dummy summary text goes here.</p>
        </div>

        <div className="mb-3">
          <h5>Sign-off Approver</h5>
          <p>Name: John Doe</p>
          <p>Department: Finance</p>
        </div>

        <div className="mb-3">
          <h5>Reconciliation of P&amp;L Charge</h5>
          <p>Double Entry to Retirement Benefit Obligation &amp; Asset</p>
        </div>

        <div className="mb-3">
          <h5>P&amp;L Reconciliation</h5>
          <ul>
            <li>Variance amount: ₹1,20,000</li>
            <li>Total Known Differences: ₹50,000</li>
            <li>Defined Benefit P&amp;L Charge (6 months to 30 June 2024): ₹2,40,000</li>
            <li>Retirement Benefit Asset in BCS (transaction type 426): ₹1,00,000</li>
            <li>Retirement Benefit Obligation in BCS (transaction type 426): ₹1,40,000</li>
          </ul>
        </div>

        <button
          className="btn btn-primary w-100 mb-3"
          onClick={handleBeginAssessment}
          disabled={running}
        >
          Begin IFC Assessment
        </button>

        {running && (
          <div>
            <h6>Executing AI Agent Microservices...</h6>
            {progressBars.map((value, idx) => (
              <div className="progress mb-2" key={idx}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${value}%` }}
                  aria-valuenow={value}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  Microservice {idx + 1}: {value}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExtractedInfoPage;
