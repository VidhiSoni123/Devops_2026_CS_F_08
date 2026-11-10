import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Sidebar from '../../components/Sidebar'
import PortalHeader from '../../components/PortalHeader'
import { useAuth } from '../../context/useAuth'

function CandidatePortal() {
  const { user } = useAuth()

  const [resumes, setResumes] = useState([])
  const [jobDescription, setJobDescription] = useState(null)
  const [jdText, setJdText] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [jdUploadMessage, setJdUploadMessage] = useState('')

  // Upload History States
  const [uploadedResumes, setUploadedResumes] = useState([])
  const [uploadedJDs, setUploadedJDs] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  // ATS Analysis States
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [selectedJDId, setSelectedJDId] = useState('')
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [analysisError, setAnalysisError] = useState('')

  // Fetch Candidate Upload History
  const fetchUploadHistory = useCallback(async () => {
    if (!user?.id) return

    try {
      setHistoryLoading(true)
      setHistoryError('')

      const headers = {
        'x-candidate-id': user.id
      }

      const [resumeResponse, jdResponse] = await Promise.all([
        axios.get(
          'http://localhost:5000/api/resumes/my-resumes',
          { headers }
        ),
        axios.get(
          'http://localhost:5000/api/job-descriptions/my-descriptions',
          { headers }
        )
      ])

      setUploadedResumes(resumeResponse.data.resumes)
      setUploadedJDs(jdResponse.data.jobDescriptions)

    } catch {
      setHistoryError('Unable to load upload history.')
    } finally {
      setHistoryLoading(false)
    }
  }, [user])

  // Load History When Dashboard Opens
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUploadHistory()
    }, 0)

    return () => clearTimeout(timer)
  }, [fetchUploadHistory])

  // Resume File Selection
  const handleResumeUpload = (event) => {
    const files = Array.from(event.target.files || [])

    const pdfFiles = files.filter(
      (file) =>
        file.type === 'application/pdf' &&
        file.name.toLowerCase().endsWith('.pdf')
    )

    setResumes(pdfFiles)
    setUploadMessage('')

    if (pdfFiles.length !== files.length) {
      setUploadMessage('Only PDF files are allowed.')
    }
  }

  // Resume Upload API
  const handleResumeSubmit = async () => {
    if (!user?.id || resumes.length === 0) {
      setUploadMessage('Please select resumes and login again.')
      return
    }

    const formData = new FormData()

    resumes.forEach((file) => {
      formData.append('resumes', file)
    })

    try {
      setUploading(true)
      setUploadMessage('Uploading resumes...')

      const response = await axios.post(
        'http://localhost:5000/api/resumes/multiple',
        formData,
        {
          headers: {
            'x-candidate-id': user.id
          }
        }
      )

      setUploadMessage(
        `${response.data.totalUploaded} resume(s) uploaded successfully.`
      )

      setResumes([])
      await fetchUploadHistory()

    } catch (error) {
      setUploadMessage(
        error.response?.data?.message || 'Resume upload failed.'
      )
    } finally {
      setUploading(false)
    }
  }

  // JD File Selection
  const handleJDUpload = (event) => {
    const file = event.target.files[0] || null

    setJobDescription(file)
    setJdUploadMessage('')
  }

  // JD Upload API
  const handleJDSubmit = async () => {
    if (!user?.id) {
      setJdUploadMessage('Please login again.')
      return
    }

    if (!jobDescription && !jdText.trim()) {
      setJdUploadMessage(
        'Please select a JD file or enter JD text.'
      )
      return
    }

    const formData = new FormData()

    if (jobDescription) {
      formData.append('jdFile', jobDescription)
    }

    formData.append('jdText', jdText)

    try {
      setUploading(true)
      setJdUploadMessage('Uploading job description...')

      const response = await axios.post(
        'http://localhost:5000/api/job-descriptions/upload',
        formData,
        {
          headers: {
            'x-candidate-id': user.id
          }
        }
      )

      setJdUploadMessage(response.data.message)

      setJobDescription(null)
      setJdText('')

      await fetchUploadHistory()

    } catch (error) {
      setJdUploadMessage(
        error.response?.data?.message || 'JD upload failed.'
      )
    } finally {
      setUploading(false)
    }
  }

  // ATS Resume Analysis API
  const handleAnalyze = async () => {
    if (!user?.id || !selectedResumeId || !selectedJDId) {
      setAnalysisError('Please select a resume and job description.')
      return
    }

    try {
      setAnalysisLoading(true)
      setAnalysisError('')
      setAnalysisResult(null)

      const response = await axios.post(
        'http://localhost:5000/api/analysis/analyze',
        {
          resumeId: selectedResumeId,
          jobDescriptionId: selectedJDId
        },
        {
          headers: {
            'x-candidate-id': user.id
          }
        }
      )

      setAnalysisResult(response.data.analysis)

    } catch (error) {
      setAnalysisError(
        error.response?.data?.message || 'Resume analysis failed.'
      )
    } finally {
      setAnalysisLoading(false)
    }
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
            Upload your resumes and a job description to discover
            your ATS compatibility, skill gaps and career opportunities.
          </p>
        </div>

        {/* Upload Sections */}
        <div className="candidate-upload-grid">

          {/* Resume Upload Section */}
          <div className="candidate-upload-card">
            <div className="upload-icon">📄</div>

            <h2>Upload Your Resumes</h2>
            <p>Select multiple resumes in PDF format.</p>

            <label className="upload-button">
              Choose Resumes
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                onChange={handleResumeUpload}
                hidden
              />
            </label>

            <div className="file-status">
              {resumes.length > 0 ? (
                <div>
                  <p className="file-success">
                    ✓ {resumes.length} resume(s) selected
                  </p>

                  {resumes.map((file, index) => (
                    <p key={`${file.name}-${index}`}>
                      {index + 1}. {file.name}
                    </p>
                  ))}
                </div>
              ) : (
                <span>No resumes selected</span>
              )}
            </div>

            <button
              type="button"
              className="upload-button"
              onClick={handleResumeSubmit}
              disabled={uploading || resumes.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload Resumes'}
            </button>

            {uploadMessage && (
              <p className="file-status">{uploadMessage}</p>
            )}
          </div>

          {/* Job Description Section */}
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

            <button
              type="button"
              className="upload-button"
              onClick={handleJDSubmit}
              disabled={
                uploading ||
                (!jobDescription && !jdText.trim())
              }
            >
              {uploading
                ? 'Uploading...'
                : 'Upload Job Description'}
            </button>

            {jdUploadMessage && (
              <p className="file-status">{jdUploadMessage}</p>
            )}
          </div>

        </div>

        {/* Upload History Section */}
        <div className="candidate-history-section">

          <div className="history-header">
            <h2>Your Upload History</h2>
            <p>
              View your previously uploaded resumes and job descriptions.
            </p>
          </div>

          {historyLoading && (
            <p className="history-message">
              Loading upload history...
            </p>
          )}

          {historyError && (
            <p className="history-error">{historyError}</p>
          )}

          {!historyLoading && !historyError && (
            <div className="history-grid">

              {/* Resume History */}
              <div className="history-card">
                <h3>
                  📄 Uploaded Resumes ({uploadedResumes.length})
                </h3>

                {uploadedResumes.length > 0 ? (
                  uploadedResumes.map((resume) => (
                    <div
                      className="history-item"
                      key={resume._id}
                    >
                      <div>
                        <p className="history-file-name">
                          {resume.originalFileName}
                        </p>

                        <span>
                          {new Date(
                            resume.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <span className="history-file-type">
                        PDF
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="history-empty">
                    No resumes uploaded yet.
                  </p>
                )}
              </div>

              {/* JD History */}
              <div className="history-card">
                <h3>
                  💼 Uploaded Job Descriptions ({uploadedJDs.length})
                </h3>

                {uploadedJDs.length > 0 ? (
                  uploadedJDs.map((jd) => (
                    <div
                      className="history-item"
                      key={jd._id}
                    >
                      <div>
                        <p className="history-file-name">
                          {jd.originalFileName ||
                            'Text-based Job Description'}
                        </p>

                        <span>
                          {new Date(
                            jd.createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <span className="history-file-type">
                        {jd.mimeType
                          ? jd.mimeType.includes('pdf')
                            ? 'PDF'
                            : jd.mimeType.includes('wordprocessingml')
                              ? 'DOCX'
                              : 'DOC'
                          : 'TEXT'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="history-empty">
                    No job descriptions uploaded yet.
                  </p>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Resume Analysis Section */}
        <div className="candidate-action-section">
          <h2>Resume ATS Analysis</h2>

          <p>
            Select an uploaded resume and job description
            to check your ATS compatibility.
          </p>

          {/* Resume Selection */}
          <div className="analysis-selection">
            <label htmlFor="resume-select">
              Select Resume
            </label>

            <select
              id="resume-select"
              value={selectedResumeId}
              onChange={(event) => {
                setSelectedResumeId(event.target.value)
                setAnalysisResult(null)
                setAnalysisError('')
              }}
            >
              <option value="">Choose an uploaded resume</option>

              {uploadedResumes.map((resume) => (
                <option
                  key={resume._id}
                  value={resume._id}
                >
                  {resume.originalFileName}
                </option>
              ))}
            </select>
          </div>

          {/* Job Description Selection */}
          <div className="analysis-selection">
            <label htmlFor="jd-select">
              Select Job Description
            </label>

            <select
              id="jd-select"
              value={selectedJDId}
              onChange={(event) => {
                setSelectedJDId(event.target.value)
                setAnalysisResult(null)
                setAnalysisError('')
              }}
            >
              <option value="">
                Choose an uploaded job description
              </option>

              {uploadedJDs.map((jd) => (
                <option
                  key={jd._id}
                  value={jd._id}
                >
                  {jd.originalFileName ||
                    'Text-based Job Description'}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="analyze-button"
            onClick={handleAnalyze}
            disabled={
              !selectedResumeId ||
              !selectedJDId ||
              analysisLoading
            }
          >
            {analysisLoading
              ? 'Analyzing Resume...'
              : 'Analyze My Resume'}
          </button>

          {analysisError && (
            <p className="history-error">
              {analysisError}
            </p>
          )}

          {/* ATS Analysis Results */}
          {analysisResult && (
            <div className="analysis-result">

              <h2>ATS Analysis Results</h2>

              <p>
                <strong>Resume:</strong>{' '}
                {analysisResult.resumeName}
              </p>

              <p>
                <strong>Job Description:</strong>{' '}
                {analysisResult.jobDescriptionName}
              </p>

              <div className="ats-score">
                <h3>ATS Compatibility Score</h3>

                <div className="ats-score-value">
                  {analysisResult.atsScore}%
                </div>
              </div>

              <div className="analysis-stats">
                <div>
                  <h3>{analysisResult.totalRequiredSkills}</h3>
                  <p>Required Skills</p>
                </div>

                <div>
                  <h3>{analysisResult.totalMatchedSkills}</h3>
                  <p>Matched Skills</p>
                </div>

                <div>
                  <h3>{analysisResult.totalMissingSkills}</h3>
                  <p>Missing Skills</p>
                </div>
              </div>

              <div className="analysis-skills">
                <div>
                  <h3>Matched Skills</h3>

                  {analysisResult.matchedSkills.length > 0 ? (
                    <ul>
                      {analysisResult.matchedSkills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No matching skills found.</p>
                  )}
                </div>

                <div>
                  <h3>Missing Skills</h3>

                  {analysisResult.missingSkills.length > 0 ? (
                    <ul>
                      {analysisResult.missingSkills.map((skill) => (
                        <li key={skill}>{skill}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No missing skills found.</p>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </section>
    </div>
  )
}

export default CandidatePortal