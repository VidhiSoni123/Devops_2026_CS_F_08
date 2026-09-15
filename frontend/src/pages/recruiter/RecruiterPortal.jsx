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
      </section>
    </div>
  )
}

export default RecruiterPortal