import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'

import RecruiterPortal from './pages/recruiter/RecruiterPortal'
import RecruiterLogin from './pages/recruiter/RecruiterLogin'
import RecruiterSignup from './pages/recruiter/RecruiterSignup'
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics'
import RecruiterCandidates from './pages/recruiter/RecruiterCandidates'

import CandidatePortal from './pages/candidate/CandidatePortal'
import CandidateLogin from './pages/candidate/CandidateLogin'
import CandidateSignup from './pages/candidate/CandidateSignup'

import MainLayout from './layouts/MainLayout'
import { AuthProvider } from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import PortalHeader from './components/PortalHeader'
import ResumeAnalysis from './pages/candidate/ResumeAnalysis'
import JobRecommendations from './pages/candidate/JobRecommendations'
import CandidateComparison from './pages/recruiter/CandidateComparison'
import CandidateAnalytics from './pages/candidate/CandidateAnalytics'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>

            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Recruiter Dashboard */}
            <Route
              path="/recruiter"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterPortal />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Login & Signup */}
            <Route
              path="/recruiter/login"
              element={<RecruiterLogin />}
            />

            <Route
              path="/recruiter/signup"
              element={<RecruiterSignup />}
            />

            {/* Recruiter Candidates */}
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

                      <RecruiterCandidates />
                    </section>
                  </div>
                </ProtectedRoute>
              }
            />
            {/* Recruiter Candidate Comparison */}
<Route
  path="/recruiter/compare"
  element={
    <ProtectedRoute role="recruiter">
      <div className="portal-layout">
        <Sidebar role="recruiter" />

        <section className="portal-content">
          <PortalHeader
            title="Candidate Comparison"
            description="Compare multiple candidate profiles and skills."
          />

          <CandidateComparison />
        </section>
      </div>
    </ProtectedRoute>
  }
/>

            {/* Recruiter Analytics */}
            <Route
              path="/recruiter/analytics"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruiterAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Candidate Dashboard */}
            <Route
              path="/candidate"
              element={
                <ProtectedRoute role="candidate">
                  <CandidatePortal />
                </ProtectedRoute>
              }
            />
            <Route
  path="/candidate/resume"
  element={
    <ProtectedRoute role="candidate">
      <ResumeAnalysis />
    </ProtectedRoute>
  }
/>
{/* Candidate Job Recommendations */}
<Route
  path="/candidate/jobs"
  element={
    <ProtectedRoute role="candidate">
      <JobRecommendations />
    </ProtectedRoute>
  }
/>
{/* Candidate Analytics */}
<Route
  path="/candidate/analytics"
  element={
    <ProtectedRoute role="candidate">
      <div className="portal-layout">
        <Sidebar role="candidate" />

        <section className="portal-content">
          <PortalHeader
            title="My Analytics"
            description="Track your resume and ATS performance."
          />

          <CandidateAnalytics />
        </section>
      </div>
    </ProtectedRoute>
  }
/>

            {/* Candidate Login & Signup */}
            <Route
              path="/candidate/login"
              element={<CandidateLogin />}
            />

            <Route
              path="/candidate/signup"
              element={<CandidateSignup />}
            />

          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App