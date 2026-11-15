const mongoose = require("mongoose");
const Analysis = require("../models/Analysis");

const analysisSchema = new mongoose.Schema(
    {
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        resume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Resume",
            required: true
        },

        jobDescription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "JobDescription",
            required: true
        },

        resumeName: {
            type: String,
            required: true
        },

        jobDescriptionName: {
            type: String,
            required: true
        },

        atsScore: {
            type: Number,
            required: true
        },

        report: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Analysis", analysisSchema);