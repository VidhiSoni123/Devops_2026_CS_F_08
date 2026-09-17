 
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RecruiterSignup from './pages/recruiter/RecruiterSignup'

import Home from './pages/Home'
import RecruiterPortal from './pages/recruiter/RecruiterPortal'
import RecruiterLogin from './pages/recruiter/RecruiterLogin'
import CandidatePortal from './pages/candidate/CandidatePortal'
import MainLayout from './layouts/MainLayout'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/recruiter" element={<RecruiterPortal />} />
          <Route path="/recruiter/login" element={<RecruiterLogin />} />
          <Route path="/recruiter/signup" element={<RecruiterSignup />} />

          <Route path="/candidate" element={<CandidatePortal />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App