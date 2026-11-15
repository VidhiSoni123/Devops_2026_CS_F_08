const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const User = require("../models/User");
const Resume = require("../models/Resume");
const Analysis = require("../models/Analysis");

const router = express.Router();

const PROJECT_ROOT = path.join(__dirname, "../..");

// Read recruiter-specific Gold CSV
const readResumeAnalytics = (exportPath) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(exportPath)) {
            return resolve([]);
        }

        const files = fs.readdirSync(exportPath);

        const csvFile = files.find(
            file => file.startsWith("part-") && file.endsWith(".csv")
        );

        if (!csvFile) {
            return resolve([]);
        }

        const resumeDepartments = [];

        fs.createReadStream(path.join(exportPath, csvFile))
            .pipe(csv())
            .on("data", row => {
                resumeDepartments.push({
                    department: row.Category,
                    totalResumes: Number(row.total_resumes),
                    percentage: Number(row.percentage)
                });
            })
            .on("end", () => resolve(resumeDepartments))
            .on("error", reject);
    });
};

// GET recruiter analytics
router.get("/recruiter", async (req, res) => {
    try {
        const recruiterId = req.headers["x-recruiter-id"];

        if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
            return res.status(400).json({
                message: "Valid recruiter ID is required."
            });
        }

        const recruiter = await User.findOne({
            _id: recruiterId,
            role: "recruiter"
        });

        if (!recruiter) {
            return res.status(404).json({
                message: "Recruiter not found."
            });
        }

        const recruiterDirectory = path.join(
            PROJECT_ROOT,
            "data_lake",
            "recruiters",
            recruiter._id.toString()
        );

        const exportPath = path.join(
            recruiterDirectory,
            "powerbi_export",
            "resume_department_analytics"
        );

        const resumeDepartments = await readResumeAnalytics(exportPath);

        const totalResumes = resumeDepartments.reduce(
            (total, department) => total + department.totalResumes,
            0
        );

        return res.status(200).json({
            message: "Recruiter analytics fetched successfully.",
            summary: {
                totalResumes,
                totalDepartments: resumeDepartments.length
            },
            resumeDepartments
        });

    } catch (error) {
        console.error("ANALYTICS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch recruiter analytics.",
            error: error.message
        });
    }
});

// GET candidate analytics
router.get("/candidate", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];

        if (!mongoose.Types.ObjectId.isValid(candidateId)) {
            return res.status(400).json({
                message: "Valid candidate ID is required."
            });
        }

        const candidate = await User.findOne({
            _id: candidateId,
            role: "candidate"
        });

        if (!candidate) {
            return res.status(404).json({
                message: "Candidate not found."
            });
        }

        const totalResumes = await Resume.countDocuments({
            uploadedBy: candidate._id
        });

        const analyses = await Analysis.find({
            candidate: candidate._id
        })
            .select("atsScore report createdAt")
            .sort({ createdAt: -1 });

        const totalAnalyses = analyses.length;

        const averageATSScore = totalAnalyses
            ? Math.round(
                analyses.reduce(
                    (total, item) => total + item.atsScore,
                    0
                ) / totalAnalyses
            )
            : 0;

        const latestATSScore = totalAnalyses
            ? analyses[0].atsScore
            : 0;

        // Calculate skill frequency from analysis reports
        const skillFrequency = {};
        const missingSkillFrequency = {};

        analyses.forEach(analysis => {
            const candidateSkills =
                analysis.report?.candidateSkills || [];

            const missingSkills =
                analysis.report?.missingSkills || [];

            [...new Set(candidateSkills)].forEach(skill => {
                skillFrequency[skill] =
                    (skillFrequency[skill] || 0) + 1;
            });

            [...new Set(missingSkills)].forEach(skill => {
                missingSkillFrequency[skill] =
                    (missingSkillFrequency[skill] || 0) + 1;
            });
        });

        const strongestSkills = Object.entries(skillFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, frequency]) => ({
                skill,
                frequency
            }));

        const skillsToImprove = Object.entries(missingSkillFrequency)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, frequency]) => ({
                skill,
                frequency
            }));

        return res.status(200).json({
            message: "Candidate analytics fetched successfully.",

            summary: {
                totalResumes,
                totalAnalyses,
                averageATSScore,
                latestATSScore
            },

            strongestSkills,
            skillsToImprove
        });

    } catch (error) {
        console.error("CANDIDATE ANALYTICS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch candidate analytics.",
            error: error.message
        });
    }
});

module.exports = router;