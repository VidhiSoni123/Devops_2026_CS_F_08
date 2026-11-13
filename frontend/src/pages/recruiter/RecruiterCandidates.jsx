import { useEffect, useState } from 'react'
import API from '../../services/api'

function RecruiterCandidates() {
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [skill, setSkill] = useState('')
    const [resumeFilter, setResumeFilter] = useState('all')

    const getRecruiterId = () => {
        const savedUser = JSON.parse(
            localStorage.getItem('careerCompassUser') || 'null'
        )
        return savedUser?.id
    }

    // Initial candidate loading
    useEffect(() => {
        let active = true

        const loadCandidates = async () => {
            try {
                const recruiterId = getRecruiterId()

                if (!recruiterId) {
                    throw new Error('Recruiter login required. Please login again.')
                }

                const response = await API.get('/resumes/recruiter/search', {
                    headers: { 'x-recruiter-id': recruiterId }
                })

                if (active) {
                    setCandidates(response.data.candidates || [])
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        err.message ||
                        'Failed to load candidates.'
                    )
                }
            } finally {
                if (active) {
                    setLoading(false)
                }
            }
        }

        loadCandidates()

        return () => {
            active = false
        }
    }, [])

    // Search candidates
    const fetchCandidates = async (e) => {
        e.preventDefault()

        try {
            setLoading(true)
            setError('')

            const recruiterId = getRecruiterId()

            if (!recruiterId) {
                throw new Error('Recruiter login required. Please login again.')
            }

            const response = await API.get('/resumes/recruiter/search', {
                params: { search, skill },
                headers: { 'x-recruiter-id': recruiterId }
            })

            setCandidates(response.data.candidates || [])
        } catch (err) {
            console.error('Candidate fetch error:', err)
            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to load candidates.'
            )
        } finally {
            setLoading(false)
        }
    }

    const filteredCandidates = candidates.filter(candidate => {
        if (resumeFilter === 'has' && candidate.totalResumes === 0) {
            return false
        }

        if (resumeFilter === 'none' && candidate.totalResumes > 0) {
            return false
        }

        return true
    })

    return (
        <div className="page-container">

            <div className="page-header">
                <h1>Candidate Management</h1>
                <p>Search, filter and explore candidate profiles.</p>
            </div>

            <form onSubmit={fetchCandidates} className="candidate-filters">

                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Filter by skill (e.g. Python)"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                />

                <select
                    value={resumeFilter}
                    onChange={(e) => setResumeFilter(e.target.value)}
                >
                    <option value="all">All Candidates</option>
                    <option value="has">Has Resume</option>
                    <option value="none">No Resume</option>
                </select>

                <button type="submit" disabled={loading}>
                    Search
                </button>

            </form>

            <div className="candidate-summary">
                <h3>Total Candidates: {filteredCandidates.length}</h3>
            </div>

            {loading && <p>Loading candidates...</p>}

            {error && <p className="error-message">{error}</p>}

            {!loading && !error && filteredCandidates.length === 0 && (
                <p>No candidates found.</p>
            )}

            <div className="candidate-grid">

                {filteredCandidates.map(candidate => (
                    <div
                        className="candidate-card"
                        key={candidate.candidateId}
                    >
                        <h3>{candidate.name}</h3>
                        <p>{candidate.email}</p>

                        <p>
                            <strong>Joined:</strong>{' '}
                            {candidate.joinedAt
                                ? new Date(candidate.joinedAt).toLocaleDateString()
                                : 'N/A'}
                        </p>

                        <p>
                            <strong>Total Resumes:</strong> {candidate.totalResumes}
                        </p>

                        <div>
                            <strong>Skills:</strong>

                            <div className="candidate-skills">
                                {candidate.skills?.length > 0
                                    ? candidate.skills.map(item => (
                                        <span key={item}>{item}</span>
                                    ))
                                    : <p>No skills detected.</p>
                                }
                            </div>
                        </div>

                        <div className="candidate-resumes">
                            <strong>Uploaded Resumes:</strong>

                            {candidate.resumes?.length > 0
                                ? candidate.resumes.map(resume => (
                                    <div
                                        key={resume.id}
                                        className="resume-item"
                                    >
                                        <p>{resume.fileName}</p>

                                        <small>
                                            {(resume.fileSize / 1024).toFixed(1)} KB
                                            {' | '}
                                            {resume.uploadedAt
                                                ? new Date(resume.uploadedAt).toLocaleDateString()
                                                : 'N/A'}
                                        </small>
                                    </div>
                                ))
                                : <p>No resumes uploaded.</p>
                            }
                        </div>

                    </div>
                ))}

            </div>
        </div>
    )
}

export default RecruiterCandidates