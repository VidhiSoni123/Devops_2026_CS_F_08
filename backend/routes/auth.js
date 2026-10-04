const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// Recruiter Signup
router.post("/recruiter/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const recruiter = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "recruiter"
        });

        res.status(201).json({
            message: "Recruiter registered successfully",
            user: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                role: recruiter.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});
// Recruiter Login
router.post("/recruiter/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const recruiter = await User.findOne({
            email,
            role: "recruiter"
        });

        if (!recruiter) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            recruiter.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Recruiter login successful",
            user: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                role: recruiter.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});
// Candidate Signup
router.post("/candidate/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const candidate = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "candidate"
        });

        res.status(201).json({
            message: "Candidate registered successfully",
            user: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                role: candidate.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});
// Candidate Login
router.post("/candidate/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const candidate = await User.findOne({
            email,
            role: "candidate"
        });

        if (!candidate) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            candidate.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Candidate login successful",
            user: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                role: candidate.role
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
});
module.exports = router;