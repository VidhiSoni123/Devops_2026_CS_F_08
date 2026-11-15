import { useEffect, useState } from "react";
import axios from "axios";

function CandidateAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const user = JSON.parse(
                    localStorage.getItem("careerCompassUser")
                );

                if (!user?.id) {
                    setError("Candidate login information not found.");
                    return;
                }

                const response = await axios.get(
                    "http://localhost:5000/api/analytics/candidate",
                    {
                        headers: {
                            "x-candidate-id": user.id
                        }
                    }
                );

                setAnalytics(response.data);
            } catch (err) {
                console.error("Analytics Error:", err);
                setError(
                    err.response?.data?.message ||
                    "Unable to load analytics."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="analytics-page">
                <p>Loading analytics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="analytics-page">
                <p className="analytics-error">{error}</p>
            </div>
        );
    }

    const summary = analytics?.summary || {};

    const stats = [
        {
            title: "Total Resumes",
            value: summary.totalResumes ?? 0,
            icon: "R"
        },
        {
            title: "Total ATS Analyses",
            value: summary.totalAnalyses ?? 0,
            icon: "A"
        },
        {
            title: "Average ATS Score",
            value: `${summary.averageATSScore ?? 0}%`,
            icon: "%"
        },
        {
            title: "Latest ATS Score",
            value: `${summary.latestATSScore ?? 0}%`,
            icon: "★"
        }
    ];

    const skills = [
        {
            title: "Strongest Skills",
            data: analytics?.strongestSkills || [],
            className: "strong-skill"
        },
        {
            title: "Skills to Improve",
            data: analytics?.skillsToImprove || [],
            className: "improve-skill"
        }
    ];

    return (
        <div className="analytics-page">

            {/* Overview Cards */}

            <div className="analytics-stats-grid">
                {stats.map((stat, index) => (
                    <div className="analytics-stat-card" key={index}>
                        <div className="analytics-stat-icon">
                            {stat.icon}
                        </div>

                        <div>
                            <p>{stat.title}</p>
                            <h2>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* ATS Score Overview */}

            <div className="analytics-section">
                <h2>ATS Score Overview</h2>

                {summary.totalAnalyses > 0 ? (
                    <div className="ats-overview">

                        <div className="ats-score-circle">
                            <span>
                                {summary.averageATSScore ?? 0}%
                            </span>
                            <small>Average Score</small>
                        </div>

                        <div className="ats-overview-details">

                            <div>
                                <span>Latest Score</span>
                                <strong>
                                    {summary.latestATSScore ?? 0}%
                                </strong>
                            </div>

                            <div>
                                <span>Total Analyses</span>
                                <strong>
                                    {summary.totalAnalyses}
                                </strong>
                            </div>

                            <div>
                                <span>Total Resumes</span>
                                <strong>
                                    {summary.totalResumes}
                                </strong>
                            </div>

                        </div>
                    </div>
                ) : (
                    <p className="analytics-empty">
                        No ATS analysis available yet. Analyze your resume
                        against a job description to see your performance.
                    </p>
                )}
            </div>

            {/* Skills Analysis */}

            <div className="analytics-skills-grid">

                {skills.map((section, index) => (
                    <div className="analytics-section" key={index}>

                        <h2>{section.title}</h2>

                        {section.data.length > 0 ? (
                            <div className="analytics-skill-list">

                                {section.data.map((skill, skillIndex) => (
                                    <div
                                        className={`analytics-skill-item ${section.className}`}
                                        key={skillIndex}
                                    >
                                        <span>{skill.skill}</span>

                                        <strong>
                                            {skill.frequency}{" "}
                                            {skill.frequency === 1
                                                ? "analysis"
                                                : "analyses"}
                                        </strong>
                                    </div>
                                ))}

                            </div>
                        ) : (
                            <p className="analytics-empty">
                                No skill data available yet.
                            </p>
                        )}

                    </div>
                ))}

            </div>

        </div>
    );
}

export default CandidateAnalytics;