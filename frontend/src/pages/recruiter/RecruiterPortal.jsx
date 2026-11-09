import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import PortalHeader from "../../components/PortalHeader";
import { useAuth } from "../../context/useAuth";
import API from "../../services/api";

function RecruiterPortal() {
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadData, setUploadData] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please select a CSV file.");
      return;
    }

    if (!user?.id) {
      setMessage("Recruiter information not found. Please login again.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      setUploadData(null);

      const response = await API.post("/uploads/csv", formData, {
        headers: {
          "x-recruiter-id": user.id,
        },
      });

      setUploadData(response.data.upload);
      setMessage(response.data.message);
      setFile(null);

      e.target.reset();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "CSV upload failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-layout">
      <Sidebar role="recruiter" />

      <section className="portal-content">
        <PortalHeader
          title="Recruiter Dashboard"
          description="Manage candidates, recruitment data and hiring analytics."
        />

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <span className="dashboard-card-label">Total Candidates</span>
            <h2>120</h2>
            <p>Candidates in the system</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-card-label">Active Jobs</span>
            <h2>15</h2>
            <p>Currently available positions</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-card-label">Matched Candidates</span>
            <h2>84</h2>
            <p>Candidates matching job requirements</p>
          </div>

          <div className="dashboard-card">
            <span className="dashboard-card-label">Pending Review</span>
            <h2>36</h2>
            <p>Applications waiting for review</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recruitment Overview</h2>
          <p>
            Use the navigation menu to manage candidates, upload recruitment
            data and view hiring analytics.
          </p>
        </div>

        <div className="csv-upload-section">
          <h2>Upload Recruitment Data</h2>

          <p>
            Upload a CSV file containing candidate recruitment records.
          </p>

          <form onSubmit={handleUpload}>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files[0] || null);
                setMessage("");
                setUploadData(null);
              }}
            />

            {file && <p>Selected file: {file.name}</p>}

            <button type="submit" disabled={loading || !file}>
              {loading ? "Uploading..." : "Upload CSV"}
            </button>
          </form>

          {message && (
            <p className="csv-upload-message" role="status">
              {message}
            </p>
          )}

          {uploadData && (
            <div className="upload-result">
              <h3>Upload Summary</h3>
              <p><strong>File:</strong> {uploadData.fileName}</p>
              <p><strong>Total Records:</strong> {uploadData.totalRecords}</p>
              <p><strong>Successful:</strong> {uploadData.successfulRecords}</p>
              <p><strong>Failed:</strong> {uploadData.failedRecords}</p>
              <p><strong>Status:</strong> {uploadData.status}</p>
              <p>
                <strong>Columns:</strong>{" "}
                {uploadData.columns.join(", ")}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default RecruiterPortal;