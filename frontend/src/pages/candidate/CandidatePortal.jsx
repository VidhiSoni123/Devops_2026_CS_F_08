import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import PortalHeader from '../../components/PortalHeader'

function CandidatePortal() {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState(null)
  const [jdText, setJdText] = useState('')

  const handleResumeUpload = (event) => {
    setResume(event.target.files[0] || null)
  }

  const handleJDUpload = (event) => {
    setJobDescription(event.target.files[0] || null)
  }

  return (
    <div className="portal-layout">
      <Sidebar role="candidate" />

      <section className="portal-content">
        <PortalHeader
          title="Candidate Dashboard"
          description="Analyze your resume and explore career opportunities."
        />

        <div className="candidate-welcome dashboard-section">
          <h2>Welcome to Career Compass!</h2>
          <p>
            Upload your resume and a job description to discover
            your ATS compatibility, skill gaps and career opportunities.
          </p>
        </div>

        <div className="candidate-upload-grid">

          <div className="candidate-upload-card">
            <div className="upload-icon">📄</div>
            <h2>Upload Your Resume</h2>
            <p>Upload your latest resume in PDF format.</p>

            <label className="upload-button">
              Choose Resume
              <input
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                hidden
              />
            </label>

            <div className="file-status">
              {resume ? (
                <span className="file-success">
                  ✓ {resume.name}
                </span>
              ) : (
                <span>No resume selected</span>
              )}
            </div>
          </div>

          <div className="candidate-upload-card">
            <div className="upload-icon">💼</div>
            <h2>Job Description</h2>
            <p>Upload a JD document or paste its contents below.</p>

            <label className="upload-button">
              Choose JD File
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleJDUpload}
                hidden
              />
            </label>

            <div className="file-status">
              {jobDescription ? (
                <span className="file-success">
                  ✓ {jobDescription.name}
                </span>
              ) : (
                <span>No JD file selected</span>
              )}
            </div>

            <textarea
              className="jd-textarea"
              placeholder="Or paste the job description here..."
              value={jdText}
              onChange={(event) => setJdText(event.target.value)}
              rows="5"
            />
          </div>

        </div>

        <div className="candidate-action-section">
          <h2>Ready to Analyze?</h2>
          <p>
            Get insights into your resume compatibility and
            identify areas for improvement.
          </p>

          <button
            className="analyze-button"
            disabled={!resume || (!jobDescription && !jdText.trim())}
          >
            Analyze My Resume
          </button>
        </div>

      </section>
    </div>
  )
}

export default CandidatePortal