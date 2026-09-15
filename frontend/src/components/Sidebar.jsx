import { NavLink } from 'react-router-dom'

function Sidebar({ role }) {
  const isRecruiter = role === 'recruiter'

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        {isRecruiter ? 'Recruiter Portal' : 'Candidate Portal'}
      </div>

      <nav className="sidebar-nav">
        <NavLink to={isRecruiter ? '/recruiter' : '/candidate'}>
          Dashboard
        </NavLink>

        {isRecruiter ? (
          <>
            <NavLink to="/recruiter/candidates">
              Candidates
            </NavLink>

            <NavLink to="/recruiter/analytics">
              Analytics
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/candidate/resume">
              Resume Analysis
            </NavLink>

            <NavLink to="/candidate/jobs">
              Job Recommendations
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar