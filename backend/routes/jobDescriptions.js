const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const JobDescription = require("../models/JobDescription");
const User = require("../models/User");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/job-descriptions");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },

    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();

        const allowedTypes = {
            ".pdf": "application/pdf",
            ".doc": "application/msword",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        };

        if (allowedTypes[extension] !== file.mimetype) {
            return cb(new Error("Only PDF, DOC and DOCX files are allowed."));
        }

        cb(null, true);
    }
});

router.post("/upload", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];

        if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
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

        upload.single("jdFile")(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            try {
                const jdText = req.body.jdText?.trim() || "";

                if (!req.file && !jdText) {
                    return res.status(400).json({
                        success: false,
                        message: "Please upload a JD file or enter JD text."
                    });
                }

                const savedJD = await JobDescription.create({
                    originalFileName: req.file?.originalname || null,
                    storedFileName: req.file?.filename || null,
                    filePath: req.file?.path || null,
                    fileSize: req.file?.size || 0,
                    mimeType: req.file?.mimetype || null,
                    jdText,
                    uploadedBy: candidate._id
                });

                return res.status(201).json({
                    success: true,
                    message: "Job description saved successfully.",
                    jobDescription: savedJD
                });

            } catch (error) {
                if (req.file) {
                    fs.unlink(req.file.path, () => {});
                }

                console.error("JD save error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Failed to save job description."
                });
            }
        });

    } catch (error) {
        console.error("JD upload error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });
    }
});
// Get Candidate's Uploaded Job Descriptions
router.get("/my-descriptions", async (req, res) => {
    try {
        const candidateId = req.headers["x-candidate-id"];

        if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
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

        const jobDescriptions = await JobDescription.find({
            uploadedBy: candidate._id
        })
            .select("-filePath")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            totalJobDescriptions: jobDescriptions.length,
            jobDescriptions
        });

    } catch (error) {
        console.error("JD retrieval error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch job descriptions."
        });
    }
});

module.exports = router;