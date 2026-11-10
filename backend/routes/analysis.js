const express = require("express");
const mongoose = require("mongoose");

const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const User = require("../models/User");
const extractText = require("../utils/extractText");

const router = express.Router();

// Technical skills database
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

// Find skills mentioned in text
function extractSkills(text) {
    const normalizedText = text.toLowerCase();

    return skillsDatabase.filter((skill) => {
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        const regex = new RegExp(
            `(^|[^a-z0-9+#.])${escapedSkill.toLowerCase()}([^a-z0-9+#.]|$)`,
            "i"
        );

        return regex.test(normalizedText);
    });
}

// ATS Analysis API
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

        // Extract job description text
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

        // Identify matching and missing skills
        const requiredSkills = extractSkills(jdText);
        const candidateSkills = extractSkills(resumeText);

        const matchedSkills = requiredSkills.filter((skill) =>
            candidateSkills.includes(skill)
        );

        const missingSkills = requiredSkills.filter((skill) =>
            !candidateSkills.includes(skill)
        );

        // Calculate ATS score
        const atsScore = requiredSkills.length > 0
            ? Math.round(
                (matchedSkills.length / requiredSkills.length) * 100
            )
            : 0;

        return res.status(200).json({
            success: true,
            message: "Resume analysis completed successfully.",
            analysis: {
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
                missingSkills
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