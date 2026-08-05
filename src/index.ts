import express from "express";
import jobRolesRouter from "./routes/jobRolesRouter";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

app.use("/", jobRolesRouter);

// Root endpoint
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to your API!" });
// });

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/health`);
});