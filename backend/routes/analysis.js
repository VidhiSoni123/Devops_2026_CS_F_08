const express = require("express");
const mongoose = require("mongoose");

const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const User = require("../models/User");
const Analysis = require("../models/Analysis");
const extractText = require("../utils/extractText");

const router = express.Router();

// ==========================================
// TECHNICAL SKILLS DATABASE
// ==========================================

const skillsDatabase = [
    "C", "C++", "Java", "Python", "JavaScript", "TypeScript",
    "HTML", "CSS", "React", "Node.js", "Express",
    "MongoDB", "MySQL", "SQL", "PostgreSQL",
    "Data Structures", "Algorithms", "OOP",
    "Machine Learning", "Deep Learning", "Artificial Intelligence",
    "Data Analysis", "Data Engineering", "PySpark",
    "Azure", "AWS", "Docker", "Kubernetes",
    "Git", "GitHub", "Power BI", "Tableau",
    "Pandas", "NumPy", "Scikit-learn",
    "REST API", "Django", "Flask", "Spring Boot",
    "Communication", "Problem Solving", "Leadership"
];

// ==========================================
// STOP WORDS
// ==========================================

const stopWords = new Set([
    "the", "and", "for", "with", "you", "your", "our",
    "are", "will", "have", "has", "this", "that", "from",
    "who", "what", "when", "where", "how", "can", "all",
    "any", "not", "but", "their", "they", "them", "his",
    "her", "its", "into", "about", "while", "based",
    "such", "must", "should", "also", "other", "etc",
    "may", "per", "one", "two", "more", "most",
    "which", "than", "then", "there", "here", "been",
    "being", "was", "were", "would", "could", "does",
    "did", "get", "got", "some", "many", "each",

    "work", "working", "years", "year", "ability",
    "strong", "good", "excellent", "required", "preferred",
    "candidate", "responsibilities", "experience",
    "knowledge", "skills", "skill", "job", "role",
    "team", "teams", "position", "using", "including",
    "looking", "motivated", "applicants", "applicant",
    "students", "pursuing", "bachelor", "degree",
    "information", "related", "field", "requirements",
    "mandatory", "eligibility", "familiarity",
    "beneficial", "advantage", "exposure",
    "qualification", "qualifications", "professional",
    "environment", "opportunity", "opportunities",
    "responsibility", "responsible", "candidate's",

    "build", "maintain", "improve", "develop",
    "transform", "validate", "assist", "help",
    "support", "manage", "create", "make",
    "understand", "collaborate", "collaborating",
    "communicate", "handle", "perform",

    "sample", "test", "document", "company",
    "fictional", "location", "overview", "months",
    "internship", "hybrid", "clearly", "practical",
    "assignments", "created", "only", "note",
    "plus", "key", "career", "compass",
    "upload", "workflow", "workflows"
]);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Extract technical skills
function extractSkills(text) {
    const normalizedText = text.toLowerCase();

    return skillsDatabase.filter((skill) => {
        const escapedSkill = skill
            .toLowerCase()
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(
            `(^|[^a-z0-9+#.])${escapedSkill}([^a-z0-9+#.]|$)`,
            "i"
        );

        return regex.test(normalizedText);
    });
}

// Normalize text
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9+#\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// Extract keywords
function extractKeywords(text) {
    const words = normalizeText(text)
        .split(" ")
        .filter(word => {
            return (
                word.length > 2 &&
                !stopWords.has(word) &&
                !/^\d+$/.test(word)
            );
        });

    return [...new Set(words)];
}

// Detect weak action verbs
function detectWeakVerbs(text) {
    const weakVerbs = [
        "worked on",
        "helped",
        "assisted",
        "responsible for",
        "did",
        "made",
        "handled",
        "participated in",
        "involved in",
        "worked with"
    ];

    const normalized = text.toLowerCase();

    return weakVerbs.filter(verb => {
        const escapedVerb = verb.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(`\\b${escapedVerb}\\b`, "i");

        return regex.test(normalized);
    });
}

// Detect formatting issues
function detectFormattingIssues(text) {
    const issues = [];

    if (text.length < 500) {
        issues.push("Resume content appears too short.");
    }

    if (!/\b[\w.-]+@[\w.-]+\.\w+\b/.test(text)) {
        issues.push("Email address is missing.");
    }

    if (!/(\+?\d[\d\s()-]{8,}\d)/.test(text)) {
        issues.push("Contact number may be missing.");
    }

    if (!/\b(education|qualification|academic)\b/i.test(text)) {
        issues.push("Education section heading not detected.");
    }

    if (!/\b(experience|internship|employment|work history)\b/i.test(text)) {
        issues.push("Experience section heading not detected.");
    }

    if (!/\b(projects|personal projects|academic projects)\b/i.test(text)) {
        issues.push("Projects section heading not detected.");
    }

    if ((text.match(/[•●▪]/g) || []).length === 0) {
        issues.push("No bullet points detected. Use bullet points for readability.");
    }

    if (text.length > 15000) {
        issues.push("Resume content is very lengthy. Consider keeping it concise.");
    }

    return issues;
}

// ==========================================
// CANDIDATE: ANALYSIS HISTORY
// ==========================================

router.get("/history", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];

        if (
            !candidateId ||
            !mongoose.Types.ObjectId.isValid(candidateId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid candidate ID is required."
            });
        }

        const history = await Analysis.find({
            candidate: candidateId
        })
            .select("-report")
            .sort({ createdAt: -1 })
            .populate("resume", "originalFileName")
            .populate("jobDescription", "originalFileName");

        return res.status(200).json({
            success: true,
            totalAnalyses: history.length,
            history
        });

    } catch (error) {
        console.error("Analysis history error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch analysis history."
        });
    }
});

// ==========================================
// CANDIDATE: JOB RECOMMENDATIONS
// ==========================================

router.get("/recommendations", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];

        if (
            !candidateId ||
            !mongoose.Types.ObjectId.isValid(candidateId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid candidate ID is required."
            });
        }

        const candidate = await User.findOne({
            _id: candidateId,
            role: "candidate"
        });

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }

        // Fetch latest uploaded resume.
        // _id is used as a secondary sort when timestamps match.
        const resume = await Resume.findOne({
            uploadedBy: candidate._id
        }).sort({
            createdAt: -1,
            _id: -1
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: "Please upload a resume first."
            });
        }

        const resumeText = await extractText(resume.filePath);

        if (!resumeText || resumeText.length < 20) {
            return res.status(422).json({
                success: false,
                message: "Could not extract resume text."
            });
        }

        const candidateSkills = extractSkills(resumeText);
        const resumeKeywords = extractKeywords(resumeText);

        // Fetch candidate's uploaded JDs
        const jobDescriptions = await JobDescription.find({
            uploadedBy: candidate._id
        }).sort({ createdAt: -1, _id: -1 });

        if (jobDescriptions.length === 0) {
            return res.status(200).json({
                success: true,
                resumeName: resume.originalFileName,
                totalRecommendations: 0,
                recommendations: [],
                message: "Upload job descriptions to get recommendations."
            });
        }

        const recommendations = [];

        for (const jd of jobDescriptions) {
            try {
                let jdText = jd.jdText || "";

                if (jd.filePath) {
                    const extractedJD = await extractText(jd.filePath);
                    jdText = `${jdText} ${extractedJD}`.trim();
                }

                if (!jdText || jdText.length < 20) {
                    continue;
                }

                const requiredSkills = extractSkills(jdText);

                const matchedSkills = requiredSkills.filter(skill =>
                    candidateSkills.includes(skill)
                );

                const missingSkills = requiredSkills.filter(skill =>
                    !candidateSkills.includes(skill)
                );

                const jdKeywords = extractKeywords(jdText);

                const matchedKeywords = jdKeywords.filter(keyword =>
                    resumeKeywords.includes(keyword)
                );

                const skillScore = requiredSkills.length > 0
                    ? (matchedSkills.length / requiredSkills.length) * 100
                    : 0;

                const keywordScore = jdKeywords.length > 0
                    ? (matchedKeywords.length / jdKeywords.length) * 100
                    : 0;

                const matchScore = Math.round(
                    requiredSkills.length > 0
                        ? (skillScore * 0.7) + (keywordScore * 0.3)
                        : keywordScore
                );

                recommendations.push({
                    jobDescriptionId: jd._id,
                    jobDescriptionName:
                        jd.originalFileName || "Pasted Job Description",

                    uploadedAt: jd.createdAt,

                    matchScore,

                    scoreCategory:
                        matchScore >= 80 ? "Strong Match" :
                        matchScore >= 60 ? "Moderate Match" :
                        matchScore >= 40 ? "Needs Improvement" :
                        "Low Match",

                    totalRequiredSkills: requiredSkills.length,
                    totalMatchedSkills: matchedSkills.length,

                    matchedSkills,
                    missingSkills,

                    matchedKeywords: matchedKeywords.slice(0, 15)
                });

            } catch (jdError) {
                console.error(
                    "Recommendation processing error:",
                    jd._id,
                    jdError.message
                );
            }
        }

        recommendations.sort(
            (a, b) => b.matchScore - a.matchScore
        );

        return res.status(200).json({
            success: true,
            resumeName: resume.originalFileName,
            totalRecommendations: recommendations.length,
            recommendations
        });

    } catch (error) {
        console.error("Job recommendations error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not generate job recommendations."
        });
    }
});

// ==========================================
// CANDIDATE: DETAILED ANALYSIS REPORT
// ==========================================

router.get("/:analysisId", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];
        const { analysisId } = req.params;

        if (
            !candidateId ||
            !mongoose.Types.ObjectId.isValid(candidateId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid candidate ID is required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(analysisId)) {
            return res.status(400).json({
                success: false,
                message: "Valid analysis ID is required."
            });
        }

        const analysis = await Analysis.findOne({
            _id: analysisId,
            candidate: candidateId
        })
            .populate("resume", "originalFileName")
            .populate("jobDescription", "originalFileName");

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analysis report not found."
            });
        }

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error("Detailed report error:", error);

        return res.status(500).json({
            success: false,
            message: "Could not fetch analysis report."
        });
    }
});

// ==========================================
// CANDIDATE: ATS RESUME ANALYSIS
// ==========================================

router.post("/analyze", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];
        const { resumeId, jobDescriptionId } = req.body;

        if (
            !candidateId ||
            !mongoose.Types.ObjectId.isValid(candidateId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid candidate ID is required."
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(resumeId) ||
            !mongoose.Types.ObjectId.isValid(jobDescriptionId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid resume and job description IDs are required."
            });
        }

        const candidate = await User.findOne({
            _id: candidateId,
            role: "candidate"
        });

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: "Candidate not found."
            });
        }

        const resume = await Resume.findOne({
            _id: resumeId,
            uploadedBy: candidate._id
        });

        const jobDescription = await JobDescription.findOne({
            _id: jobDescriptionId,
            uploadedBy: candidate._id
        });

        if (!resume || !jobDescription) {
            return res.status(404).json({
                success: false,
                message: "Resume or job description not found."
            });
        }

        // Extract resume text
        const resumeText = await extractText(resume.filePath);

        if (!resumeText || resumeText.length < 20) {
            return res.status(422).json({
                success: false,
                message: "Could not extract text from this resume. It may be scanned or image-based."
            });
        }

        // Extract JD text
        let jdText = jobDescription.jdText || "";

        if (jobDescription.filePath) {
            const extractedJD = await extractText(
                jobDescription.filePath
            );

            jdText = `${jdText} ${extractedJD}`.trim();
        }

        if (!jdText || jdText.length < 20) {
            return res.status(422).json({
                success: false,
                message: "Could not extract sufficient text from the job description."
            });
        }

        // 1. Skill matching
        const requiredSkills = extractSkills(jdText);
        const candidateSkills = extractSkills(resumeText);

        const matchedSkills = requiredSkills.filter(skill =>
            candidateSkills.includes(skill)
        );

        const missingSkills = requiredSkills.filter(skill =>
            !candidateSkills.includes(skill)
        );

        // 2. Keyword matching
        const jdKeywords = extractKeywords(jdText);
        const resumeKeywords = extractKeywords(resumeText);

        const matchedKeywords = jdKeywords.filter(keyword =>
            resumeKeywords.includes(keyword)
        );

        const missingKeywords = jdKeywords.filter(keyword =>
            !resumeKeywords.includes(keyword)
        );

        const keywordMatchScore = jdKeywords.length > 0
            ? Math.round(
                (matchedKeywords.length / jdKeywords.length) * 100
            )
            : 0;

        // 3. Skill gap analysis
        const skillGapAnalysis = {
            totalGaps: missingSkills.length,
            missingSkills,

            priority: missingSkills.map(skill => ({
                skill,
                priority: "Recommended",
                message: `Consider learning ${skill} to improve job compatibility.`
            }))
        };

        // 4. Weak action verbs
        const weakVerbs = detectWeakVerbs(resumeText);

        const actionVerbSuggestions = weakVerbs.map(verb => ({
            weakVerb: verb,

            suggestions: [
                "Developed",
                "Implemented",
                "Designed",
                "Optimized",
                "Managed",
                "Achieved"
            ]
        }));

        // 5. Formatting checks
        const formattingIssues = detectFormattingIssues(resumeText);

        // 6. Combined ATS score
        const skillScore = requiredSkills.length > 0
            ? (matchedSkills.length / requiredSkills.length) * 100
            : 0;

        const atsScore = Math.round(
            requiredSkills.length > 0
                ? (skillScore * 0.7) + (keywordMatchScore * 0.3)
                : keywordMatchScore
        );

        // 7. Generate detailed analysis report
        const analysisReport = {
            overallScore: atsScore,

            scoreCategory:
                atsScore >= 80 ? "Strong Match" :
                atsScore >= 60 ? "Moderate Match" :
                atsScore >= 40 ? "Needs Improvement" :
                "Low Match",

            keywordAnalysis: {
                totalKeywords: jdKeywords.length,
                matchedKeywords,
                missingKeywords,
                keywordMatchScore
            },

            skillAnalysis: {
                totalRequiredSkills: requiredSkills.length,
                totalMatchedSkills: matchedSkills.length,
                totalMissingSkills: missingSkills.length,
                matchedSkills,
                missingSkills
            },

            skillGapAnalysis,

            actionVerbAnalysis: {
                weakVerbs,
                suggestions: actionVerbSuggestions
            },

            formattingAnalysis: {
                totalIssues: formattingIssues.length,
                issues: formattingIssues
            },

            recommendations: [
                ...(missingSkills.length
                    ? ["Improve missing technical skills."]
                    : []),

                ...(missingKeywords.length
                    ? ["Include relevant job description keywords where they accurately reflect your experience."]
                    : []),

                ...(weakVerbs.length
                    ? ["Replace weak action verbs with stronger achievement-oriented verbs."]
                    : []),

                ...(formattingIssues.length
                    ? ["Improve resume structure and formatting."]
                    : [])
            ]
        };

        // 8. Save analysis history in MongoDB
        const savedAnalysis = await Analysis.create({
            candidate: candidate._id,
            resume: resume._id,
            jobDescription: jobDescription._id,

            resumeName: resume.originalFileName,

            jobDescriptionName:
                jobDescription.originalFileName || "Pasted Job Description",

            atsScore,

            report: {
                atsScore,
                totalRequiredSkills: requiredSkills.length,
                totalMatchedSkills: matchedSkills.length,
                totalMissingSkills: missingSkills.length,
                requiredSkills,
                candidateSkills,
                matchedSkills,
                missingSkills,
                keywordMatchScore,
                matchedKeywords,
                missingKeywords,
                skillGapAnalysis,
                weakVerbs,
                actionVerbSuggestions,
                formattingIssues,
                analysisReport
            }
        });

        // 9. Return complete analysis
        return res.status(200).json({
            success: true,
            message: "Resume analysis completed successfully.",

            analysis: {
                analysisId: savedAnalysis._id,

                resumeName: resume.originalFileName,

                jobDescriptionName:
                    jobDescription.originalFileName || "Pasted Job Description",

                atsScore,

                totalRequiredSkills: requiredSkills.length,
                totalMatchedSkills: matchedSkills.length,
                totalMissingSkills: missingSkills.length,

                requiredSkills,
                candidateSkills,
                matchedSkills,
                missingSkills,

                keywordMatchScore,
                matchedKeywords,
                missingKeywords,

                skillGapAnalysis,
                weakVerbs,
                actionVerbSuggestions,
                formattingIssues,

                analysisReport
            }
        });

    } catch (error) {
        console.error("ATS analysis error:", error);

        return res.status(500).json({
            success: false,
            message: "Resume analysis failed."
        });
    }
});

module.exports = router;