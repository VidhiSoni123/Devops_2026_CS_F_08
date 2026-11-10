const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const client = require("prom-client");

const User = require("./models/User");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = 5000;

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
name: "career_compass_http_requests_total",
help: "Total HTTP requests received by Career Compass backend",
labelNames: ["method", "route", "status"]
});

const uploadRoutes = require("./routes/uploads");
const resumeRoutes = require("./routes/resumes");
const jobDescriptionRoutes = require("./routes/jobDescriptions");
const analysisRoutes = require("./routes/analysis");

register.registerMetric(httpRequestsTotal);

// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
res.on("finish", () => {
if (req.path !== "/metrics") {
httpRequestsTotal.inc({
method: req.method,
route: req.route?.path || req.path,
status: res.statusCode
});
}
});
next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/job-descriptions", jobDescriptionRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/metrics", async (req, res) => {
res.set("Content-Type", register.contentType);
res.end(await register.metrics());
});

app.get("/", (req, res) => {
res.json({
message: "Career Compass 2.0 Backend is running"
});
});


// MongoDB connection
mongoose
.connect(process.env.MONGO_URI)
.then(() => {
console.log("MongoDB connected successfully");
})
.catch((error) => {
console.error("MongoDB connection failed:", error.message);
});

// Start server
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
