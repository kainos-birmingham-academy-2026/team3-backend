import { fileURLToPath } from "node:url";
import express from "express";
import jobRolesRouter from "./routes/jobRolesRouter";
import authRouter from "./routes/authRouter";

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());

app.use("/", jobRolesRouter);
app.use("/api/login", authRouter);

// Root endpoint
app.get("/", (req, res) => {
	res.json({ message: "Welcome to your API!" });
});

// Health check
app.get("/health", (req, res) => {
	res.json({ status: "UP", timestamp: new Date().toISOString() });
});

const isMainModule = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/health`);
  });
}

export default app;