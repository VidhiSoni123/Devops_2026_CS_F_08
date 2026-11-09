const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
    {
        originalFileName: {
            type: String,
            required: true,
            trim: true
        },

        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        totalRecords: {
            type: Number,
            default: 0
        },

        successfulRecords: {
            type: Number,
            default: 0
        },

        failedRecords: {
            type: Number,
            default: 0
        },

        columns: {
            type: [String],
            default: []
        },

        status: {
            type: String,
            enum: ["processing", "completed", "failed"],
            default: "processing"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Upload", uploadSchema);