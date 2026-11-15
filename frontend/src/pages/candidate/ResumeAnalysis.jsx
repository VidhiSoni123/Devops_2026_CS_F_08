import { useState, useEffect, useMemo } from 'react'
import API from '../../services/api'
import Sidebar from '../../components/Sidebar'
import PortalHeader from '../../components/PortalHeader'
import { useAuth } from '../../context/useAuth'

function ResumeAnalysis() {
  const { user } = useAuth()

  const [history, setHistory] = useState([])
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')

  const headers = useMemo(() => ({
    'x-candidate-id': user?.id
  }), [user?.id])

  useEffect(() => {
  let ignore = false

  async function loadHistory() {
    if (!user?.id) return

    try {
      const response = await API.get('/analysis/history', { headers })

      if (!ignore) {
        setHistory(response.data.history || [])
      }
    } catch (err) {
      if (!ignore) {
        setError(err.response?.data?.message || 'Unable to load analysis history.')
      }
    } finally {
      if (!ignore) {
        setLoading(false)
      }
    }
  }

  loadHistory()

  return () => {
    ignore = true
  }
}, [user?.id, headers])

  const openAnalysis = async (analysisId) => {
    try {
      setDetailLoading(true)
      setError('')

      const response = await API.get(`/analysis/${analysisId}`, { headers })
      setSelectedAnalysis(response.data.analysis)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load analysis report.')
    } finally {
      setDetailLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const report = selectedAnalysis?.report

  return (
    <div className="portal-layout">
      <Sidebar role="candidate" />

      <section className="portal-content">
        <PortalHeader
          title="Resume Analysis"
          description="View your previous ATS analyses and detailed reports."
        />

        <div className="candidate-analysis-page">
          <div className="analysis-history-header">
            <div>
              <h2>Analysis History</h2>
              <p>Your previously generated resume analysis reports.</p>
            </div>

            <div className="analysis-total-card">
              <span>Total Analyses</span>
              <strong>{history.length}</strong>
            </div>
          </div>

          {error && <div className="analysis-error">{error}</div>}

          {loading ? (
            <p className="analysis-status">Loading analysis history...</p>
          ) : history.length === 0 ? (
            <div className="analysis-empty">
              <h3>No analysis history found</h3>
              <p>
                Upload your resume and analyze it against a job description to get started.
              </p>
            </div>
          ) : (
            <div className="analysis-history-list">
              {history.map((item) => (
                <div className="analysis-history-card" key={item._id}>
                  <div className="analysis-history-info">
                    <h3>
                      {item.resumeName || item.resume?.originalFileName || 'Resume'}
                    </h3>
                    <p>
                      Job Description: {item.jobDescriptionName || item.jobDescription?.originalFileName || 'Job Description'}
                    </p>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <div className="analysis-history-score">
                    <strong>{item.atsScore}%</strong>
                    <span>ATS Score</span>
                  </div>

                  <button
                    type="button"
                    className="analysis-view-button"
                    onClick={() => openAnalysis(item._id)}
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}

          {detailLoading && (
            <p className="analysis-status">Loading detailed report...</p>
          )}

          {selectedAnalysis && report && (
            <div className="analysis-detail-section">
              <div className="analysis-detail-heading">
                <div>
                  <h2>Detailed Analysis Report</h2>
                  <p>
                    {selectedAnalysis.resumeName} vs {selectedAnalysis.jobDescriptionName}
                  </p>
                </div>

                <button
                  type="button"
                  className="analysis-close-button"
                  onClick={() => setSelectedAnalysis(null)}
                >
                  Close Report
                </button>
              </div>

              <div className="analysis-score-card">
                <span>ATS Compatibility Score</span>
                <strong>{selectedAnalysis.atsScore}%</strong>
              </div>

              <div className="analysis-report-grid">
                <div className="analysis-report-card">
                  <h3>Skills Analysis</h3>
                  <p>Matched Skills: {report.matchedSkills?.length || 0}</p>
                  <p>Missing Skills: {report.missingSkills?.length || 0}</p>
                  <p>Resume Skills: {report.resumeSkillCount ?? '-'}</p>
                  <p>Required Skills: {report.requiredSkillCount ?? '-'}</p>
                </div>

                <div className="analysis-report-card">
                  <h3>Keyword Analysis</h3>
                  <p>Matched Keywords: {report.matchedKeywords?.length || 0}</p>
                  <p>Missing Keywords: {report.missingKeywords?.length || 0}</p>
                </div>
              </div>

              <div className="analysis-report-card">
                <h3>Matched Skills</h3>
                <div className="analysis-tags">
                  {report.matchedSkills?.length
                    ? report.matchedSkills.map((skill, index) => (
                        <span className="analysis-tag matched" key={index}>{skill}</span>
                      ))
                    : <p>No matched skills found.</p>}
                </div>
              </div>

              <div className="analysis-report-card">
                <h3>Missing Skills</h3>
                <div className="analysis-tags">
                  {report.missingSkills?.length
                    ? report.missingSkills.map((skill, index) => (
                        <span className="analysis-tag missing" key={index}>{skill}</span>
                      ))
                    : <p>No missing skills found.</p>}
                </div>
              </div>

              <div className="analysis-report-card">
                <h3>Matched Keywords</h3>
                <div className="analysis-tags">
                  {report.matchedKeywords?.length
                    ? report.matchedKeywords.map((keyword, index) => (
                        <span className="analysis-tag matched" key={index}>{keyword}</span>
                      ))
                    : <p>No matched keywords found.</p>}
                </div>
              </div>

              <div className="analysis-report-card">
                <h3>Missing Keywords</h3>
                <div className="analysis-tags">
                  {report.missingKeywords?.length
                    ? report.missingKeywords.map((keyword, index) => (
                        <span className="analysis-tag missing" key={index}>{keyword}</span>
                      ))
                    : <p>No missing keywords found.</p>}
                </div>
              </div>

              <div className="analysis-report-card">
                <h3>Skill Gap Analysis</h3>
                <pre>
                  {JSON.stringify(
                    report.skillGapAnalysis || 'No skill gap data available.',
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="analysis-report-card">
                <h3>Weak Action Verbs</h3>
                <div className="analysis-tags">
                  {report.weakVerbs?.length
                    ? report.weakVerbs.map((verb, index) => (
                        <span className="analysis-tag missing" key={index}>{verb}</span>
                      ))
                    : <p>No weak action verbs detected.</p>}
                </div>
              </div>

              <div className="analysis-report-card">
                <h3>Action Verb Suggestions</h3>
                <pre>
                  {JSON.stringify(report.actionVerbSuggestions || [], null, 2)}
                </pre>
              </div>

              <div className="analysis-report-card">
                <h3>Formatting Issues</h3>
                {report.formattingIssues?.length
                  ? report.formattingIssues.map((issue, index) => (
                      <p key={index}>
                        • {typeof issue === 'string' ? issue : JSON.stringify(issue)}
                      </p>
                    ))
                  : <p>No formatting issues detected.</p>}
              </div>

              <div className="analysis-report-card">
                <h3>Improvement Recommendations</h3>

                {report.analysisReport?.recommendations?.length ? (
                  <ul className="analysis-recommendations-list">
                    {report.analysisReport.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No improvement recommendations available.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default ResumeAnalysis