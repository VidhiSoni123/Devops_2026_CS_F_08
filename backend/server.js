const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const authRoutes = require("./routes/auth");
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });

app.get("/", (req, res) => {
    res.json({
        message: "Career Compass 2.0 Backend is running"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});