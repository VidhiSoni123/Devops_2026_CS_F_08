import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Sidebar({ role }) {
  const isRecruiter = role === "recruiter";
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        {isRecruiter ? "Recruiter Portal" : "Candidate Portal"}
      </div>

      <nav className="sidebar-nav">
        <NavLink to={isRecruiter ? "/recruiter" : "/candidate"}>
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

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;