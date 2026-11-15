import { useEffect, useState } from 'react'
import API from '../../services/api'

function CandidateComparison() {
    const [candidates, setCandidates] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadCandidates = async () => {
            try {
                const savedUser = JSON.parse(
                    localStorage.getItem('careerCompassUser') || 'null'
                )

                if (!savedUser?.id) {
                    throw new Error('Recruiter login required.')
                }

                const response = await API.get('/resumes/recruiter/search', {
                    headers: {
                        'x-recruiter-id': savedUser.id
                    }
                })

                setCandidates(response.data.candidates || [])

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Failed to load candidates.'
                )
            } finally {
                setLoading(false)
            }
        }

        loadCandidates()
    }, [])

    const toggleCandidate = (candidate) => {
        setSelected(previous => {
            const exists = previous.some(
                item => item.candidateId === candidate.candidateId
            )

            if (exists) {
                return previous.filter(
                    item => item.candidateId !== candidate.candidateId
                )
            }

            if (previous.length >= 3) {
                return previous
            }

            return [...previous, candidate]
        })
    }

    const allSkills = [
        ...new Set(
            selected.flatMap(candidate => candidate.skills || [])
        )
    ].sort()

    const getSkillCount = candidate => candidate.skills?.length || 0

    const bestCandidate = selected.length > 1
        ? selected.reduce((best, current) =>
            getSkillCount(current) > getSkillCount(best)
                ? current
                : best
        )
        : null

    if (loading) {
        return <div className="page-container">Loading candidates...</div>
    }

    return (
        <div className="page-container comparison-page">

            

            {error && (
                <p className="error-message">{error}</p>
            )}

            {!error && (
                <>
                    <div className="comparison-selection">
                        <div>
                            <h3>Select Candidates</h3>
                            <p>
                                Select 2 or 3 candidates for side-by-side comparison.
                            </p>
                        </div>

                        <span>
                            {selected.length}/3 Selected
                        </span>
                    </div>

                    <div className="comparison-candidate-grid">

                        {candidates.map(candidate => {
                            const isSelected = selected.some(
                                item => item.candidateId === candidate.candidateId
                            )

                            return (
                                <div
                                    key={candidate.candidateId}
                                    className={`comparison-select-card ${
                                        isSelected ? 'selected' : ''
                                    }`}
                                    onClick={() => toggleCandidate(candidate)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        readOnly
                                    />

                                    <div>
                                        <h4>{candidate.name}</h4>
                                        <p>{candidate.email}</p>
                                        <small>
                                            {candidate.skills?.length || 0} Skills
                                            {' | '}
                                            {candidate.totalResumes} Resumes
                                        </small>
                                    </div>
                                </div>
                            )
                        })}

                    </div>

                    {candidates.length === 0 && (
                        <p>No candidates available.</p>
                    )}

                    {selected.length > 0 && (
                        <button
                            className="secondary-btn"
                            onClick={() => setSelected([])}
                        >
                            Clear Selection
                        </button>
                    )}

                    {selected.length >= 2 && (
                        <div className="comparison-results">

                            <h2>Comparison Results</h2>

                            <div className="comparison-table-wrapper">
                                <table className="comparison-table">

                                    <thead>
                                        <tr>
                                            <th>Profile Details</th>

                                            {selected.map(candidate => (
                                                <th key={candidate.candidateId}>
                                                    {candidate.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <tr>
                                            <td>Email</td>
                                            {selected.map(candidate => (
                                                <td key={candidate.candidateId}>
                                                    {candidate.email}
                                                </td>
                                            ))}
                                        </tr>

                                        <tr>
                                            <td>Total Resumes</td>
                                            {selected.map(candidate => (
                                                <td key={candidate.candidateId}>
                                                    {candidate.totalResumes}
                                                </td>
                                            ))}
                                        </tr>

                                        <tr>
                                            <td>Total Skills</td>
                                            {selected.map(candidate => (
                                                <td key={candidate.candidateId}>
                                                    <strong>
                                                        {getSkillCount(candidate)}
                                                    </strong>
                                                    {bestCandidate?.candidateId ===
                                                        candidate.candidateId && (
                                                        <span className="best-candidate">
                                                            Best Skill Count
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>

                                        <tr>
                                            <td>Joined On</td>
                                            {selected.map(candidate => (
                                                <td key={candidate.candidateId}>
                                                    {candidate.joinedAt
                                                        ? new Date(
                                                            candidate.joinedAt
                                                        ).toLocaleDateString()
                                                        : 'N/A'}
                                                </td>
                                            ))}
                                        </tr>

                                        {allSkills.map(skill => (
                                            <tr key={skill}>
                                                <td>{skill}</td>

                                                {selected.map(candidate => (
                                                    <td key={candidate.candidateId}>
                                                       {candidate.skills?.includes(skill)
                                                    ? <span className="skill-present">{'\u2713'}</span>
                                                    : <span className="skill-absent">{'\u2014'}</span>
                                                }
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>

                            <div className="comparison-summary">
                                <h3>Skill Comparison Summary</h3>

                                {selected.map(candidate => {
                                    const commonSkills = allSkills.filter(skill =>
                                        selected.every(item =>
                                            item.skills?.includes(skill)
                                        )
                                    )

                                    const uniqueSkills = candidate.skills?.filter(
                                        skill => !commonSkills.includes(skill)
                                    ) || []

                                    return (
                                        <div
                                            className="comparison-summary-card"
                                            key={candidate.candidateId}
                                        >
                                            <h4>{candidate.name}</h4>

                                            <p>
                                                <strong>Common Skills:</strong>
                                                {' '}
                                                {commonSkills.length > 0
                                                    ? commonSkills.join(', ')
                                                    : 'None'}
                                            </p>

                                            <p>
                                                <strong>Other Skills:</strong>
                                                {' '}
                                                {uniqueSkills.length > 0
                                                    ? uniqueSkills.join(', ')
                                                    : 'None'}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    )}
                </>
            )}

        </div>
    )
}

export default CandidateComparison