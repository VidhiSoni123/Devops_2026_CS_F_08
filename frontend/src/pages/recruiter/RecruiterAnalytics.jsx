import { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import PortalHeader from "../../components/PortalHeader";
import { useAuth } from "../../context/useAuth";
import API from "../../services/api";

function RecruiterAnalytics() {
  const { user } = useAuth();
  const recruiterId = user?.id;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    if (!recruiterId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await API.get("/analytics/recruiter", {
        headers: {
          "x-recruiter-id": recruiterId,
        },
      });

      setAnalytics(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load recruiter analytics."
      );
    } finally {
      setLoading(false);
    }
  }, [recruiterId]);

  // Initial data fetch without calling setState synchronously inside the effect.
  useEffect(() => {
  if (!recruiterId) return;

  let cancelled = false;

  const loadAnalytics = async () => {
    try {
      const response = await API.get("/analytics/recruiter", {
        headers: {
          "x-recruiter-id": recruiterId,
        },
      });

      if (!cancelled) {
        setAnalytics(response.data);
        setError("");
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err.response?.data?.message ||
            "Unable to load recruiter analytics."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadAnalytics();

  return () => {
    cancelled = true;
  };
}, [recruiterId]);

  const departments = analytics?.resumeDepartments || [];

  const totalResumes = departments.reduce(
    (total, item) => total + item.totalResumes,
    0
  );

  const maxResumes = Math.max(
    ...departments.map((item) => item.totalResumes),
    1
  );

  return (
    <div className="portal-layout">
      <Sidebar role="recruiter" />

      <section className="portal-content">
        <PortalHeader
          title="Recruitment Analytics"
          description="Explore department-wise resume distribution and recruitment insights."
        />

        <div className="dashboard-section">
          <div className="analytics-heading">
            <div>
              <h2>Resume Department Analytics</h2>
              <p>
                Department-wise resume distribution from the Resume Gold
                Layer.
              </p>
            </div>

            <button
              type="button"
              className="analytics-refresh-button"
              onClick={fetchAnalytics}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh Data"}
            </button>
          </div>

          {loading && (
            <p className="analytics-status">
              Loading resume analytics...
            </p>
          )}

          {error && (
            <div className="analytics-error">{error}</div>
          )}

          {!loading && !error && departments.length > 0 && (
            <>
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
                  <h2>{departments.length}</h2>
                  <p>Resume categories available</p>
                </div>
              </div>

              <div className="department-chart">
                <h3>Resume Distribution</h3>

                {departments.map((item) => (
                  <div
                    className="department-bar-row"
                    key={item.department}
                  >
                    <span className="department-bar-label">
                      {item.department}
                    </span>

                    <div className="department-bar-track">
                      <div
                        className="department-bar-fill"
                        style={{
                          width: `${
                            (item.totalResumes / maxResumes) * 100
                          }%`,
                        }}
                      />
                    </div>

                    <strong>{item.totalResumes}</strong>
                  </div>
                ))}
              </div>

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
                      {departments.map((item) => (
                        <tr key={item.department}>
                          <td>{item.department}</td>
                          <td>{item.totalResumes}</td>
                          <td>{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!loading && !error && departments.length === 0 && (
            <p className="analytics-status">
              No resume analytics available. Upload a resume dataset from
              the Recruiter Dashboard to get started.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default RecruiterAnalytics;