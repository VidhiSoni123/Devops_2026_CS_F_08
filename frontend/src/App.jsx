 
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RecruiterSignup from './pages/recruiter/RecruiterSignup'

import Home from './pages/Home'
import RecruiterPortal from './pages/recruiter/RecruiterPortal'
import RecruiterLogin from './pages/recruiter/RecruiterLogin'
import CandidatePortal from './pages/candidate/CandidatePortal'
import CandidateLogin from './pages/candidate/CandidateLogin'
import CandidateSignup from './pages/candidate/CandidateSignup'
import MainLayout from './layouts/MainLayout'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import PortalHeader from './components/PortalHeader'



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />

           <Route
  path="/recruiter"
  element={
    <ProtectedRoute role="recruiter">
      <RecruiterPortal />
    </ProtectedRoute>
  }
/>
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />

          <Route
  path="/candidate"
  element={
    <ProtectedRoute role="candidate">
      <CandidatePortal />
    </ProtectedRoute>
  }
/>
<Route
  path="/recruiter/candidates"
  element={
    <ProtectedRoute role="recruiter">
      <div className="portal-layout">
  <Sidebar role="recruiter" />

  <section className="portal-content">
    <PortalHeader
      title="Candidates"
      description="Manage and review candidate information."
    />

    <div className="dashboard-section">
      <h2>Candidate Management</h2>
      <p>Candidate management page is under development.</p>
    </div>
  </section>
</div>
    </ProtectedRoute>
  }
/>


<Route
  path="/recruiter/analytics"
  element={
    <ProtectedRoute role="recruiter">
      <div className="portal-layout">
        <Sidebar role="recruiter" />

        <section className="portal-content">
          <PortalHeader
            title="Recruitment Analytics"
            description="View recruitment data and hiring insights."
          />

          <div className="dashboard-section">
            <h2>Hiring Analytics</h2>
            <p>
              Recruitment analytics page is under development.
            </p>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  }
/>
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/candidate/signup" element={<CandidateSignup />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App