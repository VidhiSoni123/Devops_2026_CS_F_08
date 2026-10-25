import Sidebar from '../../components/Sidebar'
import PortalHeader from '../../components/PortalHeader'

function RecruiterPortal() {
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
      </section>
    </div>
  )
}

export default RecruiterPortal