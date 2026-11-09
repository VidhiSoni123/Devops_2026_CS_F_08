const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
    {
        originalFileName: {
            type: String,
            required: true
        },

        storedFileName: {
            type: String,
            required: true,
            unique: true
        },

        filePath: {
            type: String,
            required: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        mimeType: {
            type: String,
            default: "application/pdf"
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

module.exports = mongoose.model("Resume", resumeSchema);