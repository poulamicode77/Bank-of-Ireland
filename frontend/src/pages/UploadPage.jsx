import React, { useState } from "react";
import ExcelJS from "exceljs";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_URL =
  "https://2nusphegjh.execute-api.eu-north-1.amazonaws.com/testing/upload";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [excelSheets, setExcelSheets] = useState({});
  const [selectedSheet, setSelectedSheet] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const tryLoadWorkbook = async (selectedFile) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const workbook = new ExcelJS.Workbook();
      try {
        await workbook.xlsx.load(event.target.result);

        setNeedsPassword(false);
        setUnlocked(true);

        const sheetsData = {};
        workbook.eachSheet((worksheet) => {
          const rows = [];
          worksheet.eachRow((row) => {
            const formattedRow = [];
            row.eachCell({ includeEmpty: true }, (cell) => {
              let value = "";
              if (cell.text) {
                value = cell.text;
              } else if (cell.value instanceof Date) {
                value = format(cell.value, "dd-MM-yy");
              } else if (cell.value !== null && cell.value !== undefined) {
                value = String(cell.value);
              }
              formattedRow.push(value);
            });
            rows.push(formattedRow);
          });

          const images = (worksheet.getImages() || [])
            .map((img) => {
              const media = workbook.model.media.find(
                (m) => m.index === img.imageId
              );
              if (media) {
                const blob = new Blob([media.buffer], { type: media.type });
                return URL.createObjectURL(blob);
              }
              return null;
            })
            .filter(Boolean);

          sheetsData[worksheet.name] = { rows, images };
        });

        setExcelSheets(sheetsData);
      } catch (err) {
        // If ExcelJS fails to load, file may be password protected
        setNeedsPassword(true);
        setUnlocked(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setExcelSheets({});
    setSelectedSheet("");
    setNeedsPassword(false);
    setUnlocked(false);
    setError("");

    if (selectedFile && selectedFile.name.endsWith(".xlsx")) {
      tryLoadWorkbook(selectedFile);
    }
  };

  // New: call your API endpoint with file + password
  const handlePasswordSubmit = async () => {
    setError("");
    if (!file) {
      setError("Please choose a file first.");
      return;
    }
    if (password.trim() === "") {
      setError("Please enter a password.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("password", password);

      const resp = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        // Try to parse JSON error body if available
        let text = await resp.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || JSON.stringify(json));
        } catch {
          throw new Error(`Server returned ${resp.status}: ${text}`);
        }
      }

      const result = await resp.json();

      if (result.status === "success" && result.summary) {
        // Convert backend summary into the same shape used by the local preview
        // Backend expected to return sheets with { name, rows, images? }
        const sheetsData = {};
        for (const sheet of result.summary.sheets || []) {
          // If backend returns base64 images, convert to object URLs for <img src=...>
          const images = (sheet.images || []).map((b64) => {
            // If backend already returned full data URLs, skip conversion
            if (b64.startsWith("data:")) return b64;
            return `data:image/png;base64,${b64}`;
          });

          sheetsData[sheet.name] = {
            rows: sheet.rows || [],
            images,
          };
        }

        setExcelSheets(sheetsData);
        setUnlocked(true);
        setNeedsPassword(false);
        // Auto-select first sheet if present
        const first = Object.keys(sheetsData)[0] || "";
        setSelectedSheet(first);
        // Optionally navigate to extracted page immediately:
        // navigate("/extracted-info", { state: { summary: result.summary } });
      } else {
        const msg = result.message || "Unable to unlock file with provided password.";
        setError(msg);
        setUnlocked(false);
      }
    } catch (err) {
      setError(err.message || "Network or server error.");
      setUnlocked(false);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = () => {
    // Pass the summary object to the extracted page
    const summary = { sheets: Object.keys(excelSheets).map((name) => ({
      name,
      rows: excelSheets[name].rows,
      images: (excelSheets[name].images || []).map((src) => {
        // If src is a data URL, strip prefix and send base64 only (optional)
        if (src.startsWith("data:")) {
          return src.split(",")[1];
        }
        return src;
      })
    }))};
    navigate("/extracted-info", { state: { summary } });
  };

  return (
    <div className="container mt-5">
      <div className="card p-4">
        <h3 className="mb-3">Upload Excel</h3>

        <input
          type="file"
          className="form-control mb-3"
          accept=".xlsx"
          onChange={handleFileChange}
        />

        {file && needsPassword && !unlocked && (
          <div className="border rounded p-3 mb-3 bg-light">
            <h6>Password Required</h6>
            <input
              type="password"
              className="form-control mb-2"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="btn btn-primary w-100"
              onClick={handlePasswordSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Password"}
            </button>
            {error && <div className="text-danger mt-2">{error}</div>}
          </div>
        )}

        {/* If ExcelJS could read the file locally (no password needed) */}
        {unlocked && Object.keys(excelSheets).length > 0 && (
          <div className="mb-3">
            <label className="form-label">Select Tab</label>
            <select
              className="form-select"
              value={selectedSheet}
              onChange={(e) => setSelectedSheet(e.target.value)}
            >
              <option value="">-- Choose a sheet --</option>
              {Object.keys(excelSheets).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedSheet && excelSheets[selectedSheet] && (
          <>
            <div className="row mt-4">
              {/* Data Analysis Panel */}
              <div className="col-md-6 border rounded p-3 bg-light">
                <h5>Data Analysis Panel ({selectedSheet})</h5>
                <div
                  className="table-responsive border rounded"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <table className="table table-sm table-bordered mb-0">
                    <tbody>
                      {excelSheets[selectedSheet].rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Image Analysis Panel */}
              <div className="col-md-6 border rounded p-3 bg-light">
                <h5>Image Analysis Panel ({selectedSheet})</h5>
                {excelSheets[selectedSheet].images &&
                excelSheets[selectedSheet].images.length > 0 ? (
                  <div className="mb-3">
                    {excelSheets[selectedSheet].images.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt="Excel attachment"
                        style={{ maxWidth: "150px", marginRight: "10px" }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted">No images in this tab.</p>
                )}
              </div>
            </div>

            <button
              className="btn btn-success w-100 mt-4"
              onClick={handleExtract}
            >
              Extract Information
            </button>
          </>
        )}

        {/* If file appears password protected but ExcelJS didn't detect it yet */}
        {file && !unlocked && !needsPassword && (
          <div className="mt-3 text-muted">
            If the file is password protected and not previewed, click Submit Password after entering the password.
          </div>
        )}

        {/* If file looks password protected (set by tryLoadWorkbook) */}
        {file && needsPassword && (
          <div className="mt-2 text-muted">This file appears to be password protected.</div>
        )}
      </div>
    </div>
  );
}

export default UploadPage;
