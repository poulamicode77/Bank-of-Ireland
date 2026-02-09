import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./pages/UploadPage";
import ExtractedInfoPage from "./pages/ExtractedInfoPage";
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import IFCTestResultPage from "./pages/IFCTestResultPage";

function App() {
  return (
    <Router>
      <div className="container mt-4 bd-col">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/extracted-info" element={<ExtractedInfoPage />} />
          <Route path="/ifc-test-result" element={<IFCTestResultPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
