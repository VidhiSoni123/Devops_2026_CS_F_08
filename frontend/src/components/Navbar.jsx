import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Career Compass 2.0</Link>
      </div>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/recruiter">Recruiter</Link>
        <Link to="/candidate">Candidate</Link>
      </div>
    </nav>
  )
}

export default Navbar
