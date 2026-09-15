import Sidebar from '../../components/Sidebar'
import PortalHeader from '../../components/PortalHeader'

function CandidatePortal() {
  return (
    <div className="portal-layout">
      <Sidebar role="candidate" />

      <section className="portal-content">
        <PortalHeader
          title="Candidate Dashboard"
          description="Analyze your resume and explore career opportunities."
        />
      </section>
    </div>
  )
}

export default CandidatePortal