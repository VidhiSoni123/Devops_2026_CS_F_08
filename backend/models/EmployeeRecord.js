const mongoose = require("mongoose");

const employeeRecordSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            trim: true
        },
        employeeName: {
            type: String,
            required: true,
            trim: true
        },
        salary: {
            type: Number,
            required: true,
            min: 0
        },
        departmentId: {
            type: String,
            required: true,
            trim: true
        },
        departmentName: {
            type: String,
            required: true,
            trim: true
        },
        uploadId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Upload",
            required: true
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("EmployeeRecord", employeeRecordSchema);
