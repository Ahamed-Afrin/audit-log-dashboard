import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { bulkUploadLogs } from "../services/api";

const UploadLogs = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName("");
    setProgress(0);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("Please upload a valid .json file");
      resetInput();
      return;
    }

    setFileName(file.name);

    try {
      const text = await file.text();
      let parsed;

      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("The file does not contain valid JSON");
        resetInput();
        return;
      }

      if (!Array.isArray(parsed)) {
        toast.error("JSON file must contain an array of log objects");
        resetInput();
        return;
      }

      setUploading(true);
      setProgress(0);

      const result = await bulkUploadLogs(parsed, (percent) => setProgress(percent));

      toast.success(
        `Upload complete — ${result.inserted} inserted, ${result.duplicates} duplicates, ${result.invalid || 0} invalid`
      );

      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to upload logs");
    } finally {
      setUploading(false);
      resetInput();
    }
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-body">
        <h6 className="card-title mb-3">
          <i className="bi bi-cloud-upload-fill me-2"></i>
          Bulk Upload Logs (JSON)
        </h6>

        <div className="d-flex align-items-center gap-3 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="form-control"
            style={{ maxWidth: "350px" }}
            onChange={handleFileChange}
            disabled={uploading}
          />

          {uploading && (
            <div className="flex-grow-1" style={{ minWidth: "200px" }}>
              <div className="progress" style={{ height: "20px" }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                  aria-valuenow={progress}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  {progress}%
                </div>
              </div>
              <small className="text-muted">Uploading {fileName}...</small>
            </div>
          )}
        </div>

        <small className="text-muted d-block mt-2">
          Accepts a JSON file containing an array of log objects (up to 10,000+ records).
        </small>
      </div>
    </div>
  );
};

export default UploadLogs;
