import { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import Sidebar from "../../components/Sidebar";
import PortalHeader from "../../components/PortalHeader";
import { useAuth } from "../../context/useAuth";

const skillResources = {
    python: {
        project: "Python Automation & Data Analysis",
        description: "Build a data analysis tool using Python.",
        github: "https://github.com/topics/python-projects",
        resource: "https://docs.python.org/3/tutorial/",
        resourceName: "Python Documentation"
    },
    javascript: {
        project: "JavaScript Interactive Web App",
        description: "Build an interactive application using JavaScript.",
        github: "https://github.com/topics/javascript-projects",
        resource: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        resourceName: "MDN JavaScript Guide"
    },
    react: {
        project: "React Dashboard Application",
        description: "Create a responsive dashboard using React.",
        github: "https://github.com/topics/react-projects",
        resource: "https://react.dev/learn",
        resourceName: "React Documentation"
    },
    node: {
        project: "REST API Backend",
        description: "Build a REST API with authentication and database integration.",
        github: "https://github.com/topics/nodejs",
        resource: "https://nodejs.org/en/learn",
        resourceName: "Node.js Learning"
    },
    mongodb: {
        project: "Database Management Application",
        description: "Create a CRUD application with MongoDB.",
        github: "https://github.com/topics/mongodb",
        resource: "https://www.mongodb.com/docs/",
        resourceName: "MongoDB Documentation"
    },
    sql: {
        project: "SQL Data Analytics Project",
        description: "Practice database queries and data analysis.",
        github: "https://github.com/topics/sql-project",
        resource: "https://www.w3schools.com/sql/",
        resourceName: "SQL Tutorial"
    },
    java: {
        project: "Java Management System",
        description: "Build a management application using Java.",
        github: "https://github.com/topics/java-project",
        resource: "https://dev.java/learn/",
        resourceName: "Java Learning"
    },
    "machine learning": {
        project: "Machine Learning Prediction System",
        description: "Build a predictive model using real-world datasets.",
        github: "https://github.com/topics/machine-learning",
        resource: "https://scikit-learn.org/stable/user_guide.html",
        resourceName: "Scikit-learn Guide"
    },
    docker: {
        project: "Dockerized Web Application",
        description: "Containerize an application using Docker.",
        github: "https://github.com/topics/docker",
        resource: "https://docs.docker.com/get-started/",
        resourceName: "Docker Documentation"
    },
    kubernetes: {
        project: "Kubernetes Deployment Project",
        description: "Deploy and manage a containerized application.",
        github: "https://github.com/topics/kubernetes",
        resource: "https://kubernetes.io/docs/tutorials/",
        resourceName: "Kubernetes Tutorials"
    },
    aws: {
        project: "Cloud Storage Application",
        description: "Build a cloud-based storage application.",
        github: "https://github.com/topics/aws",
        resource: "https://docs.aws.amazon.com/",
        resourceName: "AWS Documentation"
    },
    azure: {
        project: "Azure Data Pipeline",
        description: "Create a cloud-based data processing pipeline.",
        github: "https://github.com/topics/azure",
        resource: "https://learn.microsoft.com/en-us/azure/",
        resourceName: "Azure Documentation"
    },
    git: {
        project: "Collaborative GitHub Project",
        description: "Practice branching, merging and collaboration.",
        github: "https://github.com/topics/git",
        resource: "https://git-scm.com/doc",
        resourceName: "Git Documentation"
    },
    pyspark: {
        project: "Big Data Processing Pipeline",
        description: "Process large datasets using PySpark.",
        github: "https://github.com/topics/pyspark",
        resource: "https://spark.apache.org/docs/latest/api/python/",
        resourceName: "PySpark Documentation"
    },
    html: {
        project: "Responsive Portfolio Website",
        description: "Build a responsive website using HTML and CSS.",
        github: "https://github.com/topics/html-css",
        resource: "https://developer.mozilla.org/en-US/docs/Learn_web_development",
        resourceName: "MDN Web Development"
    },
    css: {
        project: "Responsive UI Design",
        description: "Create responsive layouts and modern interfaces.",
        github: "https://github.com/topics/css",
        resource: "https://developer.mozilla.org/en-US/docs/Web/CSS",
        resourceName: "CSS Documentation"
    },
    "data structures": {
        project: "DSA Visualizer",
        description: "Visualize common data structures and algorithms.",
        github: "https://github.com/topics/data-structures",
        resource: "https://www.geeksforgeeks.org/data-structures/",
        resourceName: "DSA Learning"
    },
    "power bi": {
        project: "Business Intelligence Dashboard",
        description: "Create an interactive dashboard using Power BI.",
        github: "https://github.com/topics/power-bi",
        resource: "https://learn.microsoft.com/en-us/power-bi/",
        resourceName: "Power BI Learning"
    }
};

function getRecommendations(skill) {
    const normalized = skill.toLowerCase();

    const matchedKey = Object.keys(skillResources).find(key =>
        normalized.includes(key) || key.includes(normalized)
    );

    if (matchedKey) {
        return skillResources[matchedKey];
    }

    const query = encodeURIComponent(`${skill} projects`);
    const resourceQuery = encodeURIComponent(`${skill} tutorial`);

    return {
        project: `${skill} Based Project`,
        description: `Build a practical project to improve your ${skill} skills.`,
        github: `https://github.com/search?q=${query}&type=repositories`,
        resource: `https://www.google.com/search?q=${resourceQuery}`,
        resourceName: `${skill} Learning Resources`
    };
}

function JobRecommendations() {
    const { user } = useAuth();

    const [recommendations, setRecommendations] = useState([]);
    const [resumeName, setResumeName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRecommendations = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await API.get("/analysis/recommendations", {
                headers: {
                    "x-candidate-id": user.id
                }
            });

            setRecommendations(response.data.recommendations || []);
            setResumeName(response.data.resumeName || "");

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load job recommendations."
            );
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const getScoreClass = (score) => {
        if (score >= 80) return "strong";
        if (score >= 60) return "moderate";
        if (score >= 40) return "improve";
        return "low";
    };

    return (
        <div className="portal-layout">
            <Sidebar role="candidate" />

            <section className="portal-content">
                <PortalHeader
                    title="Job Recommendations"
                    description="Discover matching jobs, GitHub projects and learning resources."
                />

                <div className="recommendation-page">

                    {resumeName && (
                        <div className="recommendation-resume-info">
                            <span>Based on your resume</span>
                            <strong>{resumeName}</strong>
                        </div>
                    )}

                    {loading ? (
                        <div className="recommendation-message">
                            Loading recommendations...
                        </div>
                    ) : error ? (
                        <div className="recommendation-message error">
                            {error}
                        </div>
                    ) : recommendations.length === 0 ? (
                        <div className="recommendation-empty">
                            <h3>No Job Recommendations Yet</h3>
                            <p>
                                Upload job descriptions from your Candidate
                                Dashboard to discover matching opportunities.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="recommendation-summary">
                                <div>
                                    <span>Total Matching Jobs</span>
                                    <h2>{recommendations.length}</h2>
                                </div>

                                <div>
                                    <span>Best Match</span>
                                    <h2>{recommendations[0].matchScore}%</h2>
                                </div>
                            </div>

                            <div className="recommendation-list">
                                {recommendations.map((job) => {
                                    const missingSkills = job.missingSkills || [];

                                    return (
                                        <article
                                            className="recommendation-card"
                                            key={job.jobDescriptionId}
                                        >
                                            <div className="recommendation-card-header">
                                                <div>
                                                    <h3>{job.jobDescriptionName}</h3>
                                                    <span className="recommendation-date">
                                                        Uploaded:{" "}
                                                        {new Date(job.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                </div>

                                                <div className={`recommendation-score ${getScoreClass(job.matchScore)}`}>
                                                    <strong>{job.matchScore}%</strong>
                                                    <span>Match</span>
                                                </div>
                                            </div>

                                            <div className="recommendation-progress">
                                                <div style={{ width: `${job.matchScore}%` }} />
                                            </div>

                                            <span className={`recommendation-category ${getScoreClass(job.matchScore)}`}>
                                                {job.scoreCategory}
                                            </span>

                                            <div className="recommendation-stats">
                                                <div>
                                                    <strong>{job.totalMatchedSkills}</strong>
                                                    <span>Matched Skills</span>
                                                </div>
                                                <div>
                                                    <strong>{job.totalRequiredSkills}</strong>
                                                    <span>Required Skills</span>
                                                </div>
                                                <div>
                                                    <strong>{missingSkills.length}</strong>
                                                    <span>Missing Skills</span>
                                                </div>
                                            </div>

                                            <div className="recommendation-skills">
                                                <h4>Matched Skills</h4>
                                                <div className="recommendation-tags">
                                                    {(job.matchedSkills || []).length > 0 ? (
                                                        job.matchedSkills.map(skill => (
                                                            <span className="matched" key={skill}>
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p>No matching skills found.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="recommendation-skills">
                                                <h4>Skills to Improve</h4>
                                                <div className="recommendation-tags">
                                                    {missingSkills.length > 0 ? (
                                                        missingSkills.map(skill => (
                                                            <span className="missing" key={skill}>
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p>All identified required skills are matched.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {missingSkills.length > 0 && (
                                                <>
                                                    <div className="recommended-learning-section">
                                                        <h4>GitHub Project Recommendations</h4>
                                                        <p className="section-description">
                                                            Practice your missing skills through these projects.
                                                        </p>

                                                        <div className="recommended-resource-grid">
                                                            {missingSkills.map(skill => {
                                                                const item = getRecommendations(skill);

                                                                return (
                                                                    <div className="recommended-resource-card" key={skill}>
                                                                        <span className="resource-skill">{skill}</span>
                                                                        <h5>{item.project}</h5>
                                                                        <p>{item.description}</p>
                                                                        <a
                                                                            href={item.github}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Explore GitHub Projects ↗
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="recommended-learning-section">
                                                        <h4>Learning Resources</h4>
                                                        <p className="section-description">
                                                            Recommended documentation and tutorials for your skill gaps.
                                                        </p>

                                                        <div className="recommended-resource-grid">
                                                            {missingSkills.map(skill => {
                                                                const item = getRecommendations(skill);

                                                                return (
                                                                    <div className="recommended-resource-card" key={skill}>
                                                                        <span className="resource-skill">{skill}</span>
                                                                        <h5>{item.resourceName}</h5>
                                                                        <p>
                                                                            Learn concepts and improve your practical knowledge.
                                                                        </p>
                                                                        <a
                                                                            href={item.resource}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            Start Learning ↗
                                                                        </a>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

export default JobRecommendations;