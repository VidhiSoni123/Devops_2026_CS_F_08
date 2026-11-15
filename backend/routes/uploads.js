const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const User = require("../models/User");

const router = express.Router();

const PROJECT_ROOT = path.join(__dirname, "../..");

const TEMP_DIRECTORY = path.join(
    PROJECT_ROOT,
    "data_lake",
    "temp_uploads"
);

// Temporary upload storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            fs.mkdirSync(TEMP_DIRECTORY, { recursive: true });
            cb(null, TEMP_DIRECTORY);
        } catch (error) {
            cb(error);
        }
    },

    filename: (req, file, cb) => {
        cb(null, `Resume-upload-${Date.now()}.csv`);
    }
});

const upload = multer({
    storage,

    limits: {
        fileSize: 100 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        if (file.originalname.toLowerCase().endsWith(".csv")) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed."));
        }
    }
});

// Validate CSV headers
const validateCSVHeaders = (filePath) => {
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        const parser = csv();

        let completed = false;

        const finish = (callback, value) => {
            if (completed) return;

            completed = true;
            stream.destroy();
            parser.destroy();
            callback(value);
        };

        parser.once("headers", (headers) => {
            finish(resolve, headers);
        });

        parser.once("error", (error) => {
            finish(reject, error);
        });

        stream.once("error", (error) => {
            finish(reject, error);
        });

        parser.once("end", () => {
            if (!completed) {
                finish(reject, new Error("CSV file is empty or invalid."));
            }
        });

        stream.pipe(parser);
    });
};

// Run recruiter-specific resume pipeline
const runResumePipeline = (recruiterId) => {
    return new Promise((resolve, reject) => {
        const pythonPath = path.join(
            PROJECT_ROOT,
            ".venv",
            "Scripts",
            "python.exe"
        );

        const javaHome = "C:\\Program Files\\Java\\jdk-21.0.12";
        const hadoopHome = "C:\\hadoop";

        const pipeline = spawn(
            pythonPath,
            [
                "data_engineering/run_pipeline.py",
                recruiterId
            ],
            {
                cwd: PROJECT_ROOT,

                env: {
                    ...process.env,
                    JAVA_HOME: javaHome,
                    HADOOP_HOME: hadoopHome,
                    PATH: [
                        path.join(javaHome, "bin"),
                        path.join(hadoopHome, "bin"),
                        process.env.PATH || ""
                    ].join(path.delimiter),
                    PYSPARK_PYTHON: pythonPath,
                    PYSPARK_DRIVER_PYTHON: pythonPath
                }
            }
        );

        let errors = "";

        pipeline.stdout.on("data", (data) => {
            console.log(data.toString());
        });

        pipeline.stderr.on("data", (data) => {
            errors += data.toString();
            console.error(data.toString());
        });

        pipeline.once("error", reject);

        pipeline.once("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(
                        errors.slice(-3000) ||
                        `Pipeline exited with code ${code}`
                    )
                );
            }
        });
    });
};

// Recruiter-specific Resume Dataset Upload
router.post(
    "/resume-dataset",
    upload.single("file"),
    async (req, res) => {
        let backupFile = null;
        let targetFile = null;

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

            if (!req.file) {
                return res.status(400).json({
                    message: "Please select a CSV file."
                });
            }

            const requiredColumns = [
                "ID",
                "Resume_str",
                "Resume_html",
                "Category"
            ];

            const headers = await validateCSVHeaders(req.file.path);

            const missingColumns = requiredColumns.filter(
                column => !headers.includes(column)
            );

            if (missingColumns.length > 0) {
                return res.status(400).json({
                    message: `Missing required columns: ${missingColumns.join(", ")}`
                });
            }

            // Create recruiter-specific directories dynamically
            const recruiterDirectory = path.join(
                PROJECT_ROOT,
                "data_lake",
                "recruiters",
                recruiter._id.toString()
            );

            const rawDirectory = path.join(
                recruiterDirectory,
                "raw"
            );

            fs.mkdirSync(rawDirectory, { recursive: true });

            targetFile = path.join(rawDirectory, "Resume.csv");

            // Backup previous recruiter dataset
            if (fs.existsSync(targetFile)) {
                backupFile = path.join(
                    rawDirectory,
                    `Resume-backup-${Date.now()}.csv`
                );

                fs.copyFileSync(targetFile, backupFile);
            }

            // Save new recruiter dataset
            fs.copyFileSync(req.file.path, targetFile);

            fs.unlinkSync(req.file.path);

            console.log(
                "Processing dataset for recruiter:",
                recruiter._id.toString()
            );

            // Execute recruiter-specific pipeline
            await runResumePipeline(recruiter._id.toString());

            // Delete backup after successful processing
            if (backupFile && fs.existsSync(backupFile)) {
                fs.unlinkSync(backupFile);
            }

            return res.status(200).json({
                success: true,
                message: "Resume dataset uploaded and processed successfully.",
                fileName: req.file.originalname,
                pipelineStatus: "completed"
            });

        } catch (error) {
            console.error("RESUME DATASET ERROR:", error);

            // Restore previous dataset if processing fails
            if (backupFile && fs.existsSync(backupFile)) {
                fs.copyFileSync(backupFile, targetFile);
                fs.unlinkSync(backupFile);
            } else if (targetFile && fs.existsSync(targetFile)) {
                fs.unlinkSync(targetFile);
            }

            return res.status(500).json({
                success: false,
                message: "Resume dataset processing failed.",
                error: error.message
            });

        } finally {
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    }
);

// Multer error handling
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message:
                error.code === "LIMIT_FILE_SIZE"
                    ? "File size cannot exceed 100 MB."
                    : error.message
        });
    }

    if (error) {
        return res.status(400).json({
            message: error.message
        });
    }

    next();
});

module.exports = router;