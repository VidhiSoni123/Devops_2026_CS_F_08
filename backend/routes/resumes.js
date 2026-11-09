const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

const Resume = require("../models/Resume");
const User = require("../models/User");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads/resumes");

fs.mkdirSync(uploadDir, { recursive: true });

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

            const savedResumes = await Resume.insertMany(resumeDocuments);

            res.status(201).json({
                success: true,
                message: "Resumes uploaded successfully.",
                totalUploaded: savedResumes.length,
                resumes: savedResumes
            });

        } catch (error) {
            console.error("Resume upload error:", error);

            res.status(500).json({
                success: false,
                message: "Resume upload failed."
            });
        }
    });
});

module.exports = router;