import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import PortalHeader from "../../components/PortalHeader";
import { useAuth } from "../../context/useAuth";
import API from "../../services/api";

function RecruiterPortal() {
  const { user } = useAuth();
  const recruiterId = user?.id;

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const [resumeDataset, setResumeDataset] = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploadMessage, setResumeUploadMessage] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Fetch recruiter resume analytics
  const fetchAnalytics = useCallback(async () => {
    if (!recruiterId) return;

    try {
      setAnalyticsLoading(true);

      const response = await API.get("/analytics/recruiter", {
        headers: {
          "x-recruiter-id": recruiterId,
        },
      });

      setAnalytics(response.data);
      setAnalyticsError("");
    } catch (error) {
      setAnalyticsError(
        error.response?.data?.message ||
          "Unable to load resume analytics."
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, [recruiterId]);

  // Initial analytics loading
  useEffect(() => {
    if (!recruiterId) return;

    let isActive = true;

    const loadAnalytics = async () => {
      try {
        const response = await API.get("/analytics/recruiter", {
          headers: {
            "x-recruiter-id": recruiterId,
          },
        });

        if (isActive) {
          setAnalytics(response.data);
          setAnalyticsError("");
        }
      } catch (error) {
        if (isActive) {
          setAnalyticsError(
            error.response?.data?.message ||
              "Unable to load resume analytics."
          );
        }
      } finally {
        if (isActive) {
          setAnalyticsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isActive = false;
    };
  }, [recruiterId]);

  // Validate selected dataset
  const handleResumeFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setResumeDataset(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setResumeDataset(null);
      setResumeUploadMessage("Please select a valid CSV file.");
      setUploadSuccess(false);
      e.target.value = "";
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setResumeDataset(null);
      setResumeUploadMessage("File size must be below 100 MB.");
      setUploadSuccess(false);
      e.target.value = "";
      return;
    }

    setResumeDataset(selectedFile);
    setResumeUploadMessage("");
    setUploadSuccess(false);
  };

  // Upload and process resume dataset
  const handleResumeDatasetUpload = async (e) => {
    e.preventDefault();

    if (!resumeDataset) {
      setResumeUploadMessage("Please select a CSV file.");
      setUploadSuccess(false);
      return;
    }

    if (!recruiterId) {
      setResumeUploadMessage(
        "Recruiter information not found. Please login again."
      );
      setUploadSuccess(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", resumeDataset);

    try {
      setResumeUploading(true);
      setResumeUploadMessage(
        "Uploading dataset and processing Bronze, Silver and Gold layers..."
      );
      setUploadSuccess(false);

      const response = await API.post(
        "/uploads/resume-dataset",
        formData,
        {
          headers: {
            "x-recruiter-id": recruiterId,
          },
        }
      );

      setResumeUploadMessage(response.data.message);
      setUploadSuccess(true);
      setResumeDataset(null);

      e.target.reset();

      await fetchAnalytics();
    } catch (error) {
      setResumeUploadMessage(
        error.response?.data?.message ||
          "Resume dataset upload failed."
      );
      setUploadSuccess(false);
    } finally {
      setResumeUploading(false);
    }
  };

  const resumeDepartments = analytics?.resumeDepartments || [];

  const totalResumes = resumeDepartments.reduce(
    (total, department) => total + department.totalResumes,
    0
  );

  const maxResumes = Math.max(
    ...resumeDepartments.map(
      (department) => department.totalResumes
    ),
    1
  );

  return (
    <div className="portal-layout">
      <Sidebar role="recruiter" />

      <section className="portal-content">
        <PortalHeader
          title="Recruiter Dashboard"
          description="Manage resume datasets and explore recruitment analytics."
        />

        {/* RESUME ANALYTICS */}
        <div className="dashboard-section">
          <div className="analytics-heading">
            <div>
              <h2>Resume Department Analytics</h2>
              <p>
                Department-wise resume distribution from the Resume Gold Layer.
              </p>
            </div>

            <button
              type="button"
              className="analytics-refresh-button"
              onClick={fetchAnalytics}
              disabled={analyticsLoading}
            >
              {analyticsLoading ? "Loading..." : "Refresh Data"}
            </button>
          </div>

          {analyticsLoading && (
            <p className="analytics-status">
              Loading resume analytics...
            </p>
          )}

          {analyticsError && (
            <div className="analytics-error">
              {analyticsError}
            </div>
          )}

          {!analyticsLoading &&
            !analyticsError &&
            resumeDepartments.length > 0 && (
              <>
                {/* KPI CARDS */}
                <div className="dashboard-cards">
                  <div className="dashboard-card">
                    <span className="dashboard-card-label">
                      Total Resumes
                    </span>
                    <h2>{totalResumes.toLocaleString("en-IN")}</h2>
                    <p>Valid resumes processed</p>
                  </div>

                  <div className="dashboard-card">
                    <span className="dashboard-card-label">
                      Total Departments
                    </span>
                    <h2>{resumeDepartments.length}</h2>
                    <p>Resume categories available</p>
                  </div>
                </div>

                {/* RESUME DISTRIBUTION CHART */}
                <div className="department-chart">
                  <h3>Resume Distribution</h3>

                  {resumeDepartments.map((department) => (
                    <div
                      className="department-bar-row"
                      key={department.department}
                    >
                      <span className="department-bar-label">
                        {department.department}
                      </span>

                      <div className="department-bar-track">
                        <div
                          className="department-bar-fill"
                          style={{
                            width: `${
                              (department.totalResumes / maxResumes) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <strong>{department.totalResumes}</strong>
                    </div>
                  ))}
                </div>

                {/* RESUME SUMMARY TABLE */}
                <div className="department-table-wrapper">
                  <h3>Department Resume Summary</h3>

                  <div className="department-table-scroll">
                    <table className="department-table">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th>Total Resumes</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>

                      <tbody>
                        {resumeDepartments.map((department) => (
                          <tr key={department.department}>
                            <td>{department.department}</td>
                            <td>{department.totalResumes}</td>
                            <td>{department.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          {!analyticsLoading &&
            !analyticsError &&
            resumeDepartments.length === 0 && (
              <p className="analytics-status">
                No resume analytics available. Upload a resume dataset to get started.
              </p>
            )}
        </div>

        {/* RESUME DATASET UPLOAD */}
        <div className="recruiter-upload-card">
          <div className="recruiter-upload-heading">
            <div>
              <span className="recruiter-upload-tag">
                DATA MANAGEMENT
              </span>

              <h2>Upload Resume Dataset</h2>

              <p>
                Upload a CSV dataset to automatically process resume records
                through Bronze, Silver and Gold layers.
              </p>
            </div>
          </div>

          <form onSubmit={handleResumeDatasetUpload}>
            <label className="recruiter-file-dropzone">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleResumeFileChange}
                disabled={resumeUploading}
              />

              <span className="recruiter-upload-icon">↑</span>

              <strong>Choose a Resume CSV file</strong>

              <span>
                Click to browse files from your computer
              </span>

              <small>
                Required columns: ID, Resume_str, Resume_html, Category
              </small>
              <small>Maximum file size: 100 MB</small>
            </label>

            {resumeDataset && (
              <div className="recruiter-selected-file">
                <div className="recruiter-file-info">
                  <span className="recruiter-file-type">CSV</span>

                  <div>
                    <strong>{resumeDataset.name}</strong>
                    <span>
                      {(resumeDataset.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="recruiter-remove-file"
                  disabled={resumeUploading}
                  onClick={() => setResumeDataset(null)}
                >
                  Remove
                </button>
              </div>
            )}

            <button
              type="submit"
              className="recruiter-upload-button"
              disabled={resumeUploading || !resumeDataset}
            >
              {resumeUploading
                ? "Processing Dataset..."
                : "Upload Resume Dataset"}
            </button>
          </form>

          {resumeUploadMessage && (
            <div
              className={`recruiter-upload-message ${
                uploadSuccess ? "success" : "error"
              }`}
              role="status"
            >
              {resumeUploadMessage}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default RecruiterPortal;