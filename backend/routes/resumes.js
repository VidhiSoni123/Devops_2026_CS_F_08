const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Resume = require("../models/Resume");
const User = require("../models/User");
const extractText = require("../utils/extractText");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/resumes");

fs.mkdirSync(uploadDir, { recursive: true });

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const uniqueName =
            `${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;

        cb(null, uniqueName);
    }
});

// Upload Configuration
const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10
    },

    fileFilter: (req, file, cb) => {
        const isPDF =
            file.mimetype === "application/pdf" &&
            path.extname(file.originalname).toLowerCase() === ".pdf";

        if (!isPDF) {
            return cb(new Error("Only PDF files are allowed."));
        }

        cb(null, true);
    }
});

// Technical Skills Database
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

// Extract Skills from Resume Text
function extractSkills(text) {
    const normalizedText = text.toLowerCase();

    return skillsDatabase.filter((skill) => {
        const escapedSkill = skill.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(
            `(^|[^a-z0-9+#.])${escapedSkill.toLowerCase()}([^a-z0-9+#.]|$)`,
            "i"
        );

        return regex.test(normalizedText);
    });
}

// ==========================================
// CANDIDATE: Upload Multiple Resumes
// ==========================================

router.post("/multiple", (req, res) => {
    upload.array("resumes", 10)(req, res, async (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

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

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Please select at least one PDF."
                });
            }

            const resumeDocuments = req.files.map((file) => ({
                originalFileName: file.originalname,
                storedFileName: file.filename,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
                uploadedBy: candidate._id
            }));

            const savedResumes =
                await Resume.insertMany(resumeDocuments);

            return res.status(201).json({
                success: true,
                message: "Resumes uploaded successfully.",
                totalUploaded: savedResumes.length,
                resumes: savedResumes
            });

        } catch (error) {
            console.error("Resume upload error:", error);

            return res.status(500).json({
                success: false,
                message: "Resume upload failed."
            });
        }
    });
});

// ==========================================
// CANDIDATE: Get Own Uploaded Resumes
// ==========================================

router.get("/my-resumes", async (req, res) => {
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

        const resumes = await Resume.find({
            uploadedBy: candidate._id
        })
            .select("-filePath")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalResumes: resumes.length,
            resumes
        });

    } catch (error) {
        console.error("Resume retrieval error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch uploaded resumes."
        });
    }
});

// ==========================================
// RECRUITER: Search and Filter Candidates
// ==========================================

router.get("/recruiter/search", async (req, res) => {
    try {
        const recruiterId = req.headers["x-recruiter-id"];
        const { search = "", skill = "" } = req.query;

        if (
            !recruiterId ||
            !mongoose.Types.ObjectId.isValid(recruiterId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid recruiter ID is required."
            });
        }

        const recruiter = await User.findOne({
            _id: recruiterId,
            role: "recruiter"
        });

        if (!recruiter) {
            return res.status(404).json({
                success: false,
                message: "Recruiter not found."
            });
        }

        // Search by candidate name or email
        const searchRegex = search
            ? new RegExp(
                search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "i"
            )
            : null;

        const candidateQuery = {
            role: "candidate"
        };

        if (searchRegex) {
            candidateQuery.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }

        const candidates = await User.find(candidateQuery)
            .select("name email createdAt")
            .limit(100)
            .sort({ createdAt: -1 });

        const results = [];

        for (const candidate of candidates) {
            const resumes = await Resume.find({
                uploadedBy: candidate._id
            })
                .select("-filePath")
                .sort({ createdAt: -1 });

            const candidateSkills = new Set();

            // Extract skills from uploaded resumes
            for (const resume of resumes) {
                try {
                    const resumeText = await extractText(
                        path.join(uploadDir, resume.storedFileName)
                    );

                    const skills = extractSkills(resumeText);

                    skills.forEach((item) =>
                        candidateSkills.add(item)
                    );

                } catch (error) {
                    console.error(
                        "Resume extraction error:",
                        error.message
                    );
                }
            }

            const skills = [...candidateSkills];

            // Skills Filter
            if (
                skill &&
                !skills.some(
                    (item) =>
                        item.toLowerCase() === skill.toLowerCase()
                )
            ) {
                continue;
            }

            results.push({
                candidateId: candidate._id,
                name: candidate.name,
                email: candidate.email,
                joinedAt: candidate.createdAt,
                totalResumes: resumes.length,
                skills,

                resumes: resumes.map((resume) => ({
                    id: resume._id,
                    fileName: resume.originalFileName,
                    fileSize: resume.fileSize,
                    uploadedAt: resume.createdAt
                }))
            });
        }

        return res.status(200).json({
            success: true,
            totalCandidates: results.length,
            candidates: results
        });

    } catch (error) {
        console.error(
            "Recruiter candidate search error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to search candidates."
        });
    }
});

module.exports = router;