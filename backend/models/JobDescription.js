const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
    {
        originalFileName: {
            type: String,
            default: null
        },

        storedFileName: {
            type: String,
            default: null
        },

        filePath: {
            type: String,
            default: null
        },

        fileSize: {
            type: Number,
            default: 0
        },

        mimeType: {
            type: String,
            default: null
        },

        jdText: {
            type: String,
            default: ""
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

module.exports = mongoose.model(
    "JobDescription",
    jobDescriptionSchema
);