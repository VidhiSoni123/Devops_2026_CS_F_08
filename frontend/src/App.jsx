 
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
          <Route path="/candidate/login" element={<CandidateLogin />} />
          <Route path="/candidate/signup" element={<CandidateSignup />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App