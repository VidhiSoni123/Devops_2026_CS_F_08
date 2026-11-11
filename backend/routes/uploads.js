const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const { Readable } = require("stream");
const mongoose = require("mongoose");

const Upload = require("../models/Upload");
const User = require("../models/User");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.originalname.toLowerCase().endsWith(".csv")) {
            cb(null, true);
        } else {
            cb(new Error("Only CSV files are allowed"));
        }
    }
});
const EmployeeRecord = require("../models/EmployeeRecord");
const fs = require("fs");
const path = require("path");

router.post("/csv", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "Please select a CSV file"
            });
        }

        const recruiterId = req.headers["x-recruiter-id"];

        if (!mongoose.Types.ObjectId.isValid(recruiterId)) {
            return res.status(400).json({
                message: "Valid recruiter ID is required"
            });
        }

        const recruiter = await User.findOne({
            _id: recruiterId,
            role: "recruiter"
        });

        if (!recruiter) {
            return res.status(404).json({
                message: "Recruiter not found"
            });
        }
        // Save original CSV to Data Lake Raw Layer
const rawDirectory = path.join(__dirname, "../../data_lake/raw");

fs.mkdirSync(rawDirectory, { recursive: true });

const safeFileName = req.file.originalname.replace(
  /[^a-zA-Z0-9._-]/g,
  "_"
);

const rawFileName = `${Date.now()}-${safeFileName}`;

fs.writeFileSync(
  path.join(rawDirectory, rawFileName),
  req.file.buffer
);

console.log(`Raw CSV saved: ${rawFileName}`);

        const records = [];

const columns = [
    "employeeId",
    "employeeName",
    "salary",
    "departmentId",
    "departmentName"
];

const firstLine = req.file.buffer.toString("utf8").split(/\r?\n/)[0];

const delimiter = firstLine.includes("\t") ? "\t" : ",";

await new Promise((resolve, reject) => {
    const parser = csv({
    separator: delimiter,
    headers: columns,
    skipLines: 1
});

    parser.on("data", (row) => {
        records.push(row);
    });

    parser.on("error", reject);
    parser.on("end", resolve);

    Readable.from(req.file.buffer).pipe(parser);
});

if (records.length === 0) {
    return res.status(400).json({
        message: "CSV file contains no records"
    });
}

const validRecords = [];
const failedRows = [];
const seenEmployeeIds = new Set();

records.forEach((row, index) => {
    const employeeId = row.employeeId?.trim();
    const employeeName = row.employeeName?.trim();
    const salary = Number(row.salary);
    const departmentId = row.departmentId?.trim();
    const departmentName = row.departmentName?.trim();

    let error = "";

    if (!employeeId || !employeeName || !row.salary ||
        !departmentId || !departmentName) {
        error = "Missing required fields";
    } else if (!Number.isFinite(salary) || salary < 0) {
        error = "Invalid salary";
    } else if (seenEmployeeIds.has(employeeId)) {
        error = "Duplicate employee ID";
    }

    if (error) {
        failedRows.push({
            row: index + 1,
            employeeId: employeeId || "N/A",
            error
        });
    } else {
        seenEmployeeIds.add(employeeId);

        validRecords.push({
            employeeId,
            employeeName,
            salary,
            departmentId,
            departmentName
        });
    }
});

const totalRecords = records.length;
const successfulRecords = validRecords.length;
const failedRecords = failedRows.length;
const savedUpload = await Upload.create({
    originalFileName: req.file.originalname,
    uploadedBy: recruiter._id,
    totalRecords,
    successfulRecords,
    failedRecords,
    columns,
    status: "processing"
});

if (validRecords.length > 0) {
    const recordsToSave = validRecords.map((record) => ({
        ...record,
        uploadId: savedUpload._id,
        uploadedBy: recruiter._id
    }));

    await EmployeeRecord.insertMany(recordsToSave);
}

savedUpload.status = "completed";
await savedUpload.save();


        

        res.status(201).json({
            message: "CSV uploaded and processed successfully",
            upload: {
                id: savedUpload._id,
                fileName: savedUpload.originalFileName,
                totalRecords: savedUpload.totalRecords,
                successfulRecords: savedUpload.successfulRecords,
                failedRecords: savedUpload.failedRecords,
                columns: savedUpload.columns,
                status: savedUpload.status,
                uploadedAt: savedUpload.createdAt,
                failedRows: failedRows
            }
        });

    } catch (error) {
        console.error("CSV UPLOAD ERROR:", error);

        res.status(500).json({
            message: "CSV upload failed",
            error: error.message
        });
    }
});

module.exports = router;