import { fileURLToPath } from "node:url";
import express from "express";
import jobRolesRouter from "./routes/jobRolesRouter";
import jobApplicationRouter from "./routes/jobApplicationsAdminRouter"
import authRouter from "./routes/authRouter";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const app = express();
const PORT = 4000;

// Middleware
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.use("/job-roles", jobRolesRouter);
app.use("/api", authRouter);
app.use("/job-applications/admin", jobApplicationRouter);

// Root endpoint

/**
 * @openapi
 * /:
 *   get:
 *     tags: [System]
 *     summary: API welcome endpoint
 *     responses:
 *       200:
 *         description: Welcome payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RootResponse'
 */

app.get("/", (req, res) => {
  res.json({ message: "Welcome to your API!" });
});

// Health check
/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: API health status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */

app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});


const isMainModule = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/health`);
    console.log(`Swagger docs available at: http://localhost:${PORT}/docs`);
  });
}

export default app;