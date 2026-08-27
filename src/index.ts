import { fileURLToPath } from "node:url";
import express from "express";
import { registerSwaggerRoutes } from "./config/swaggerRoutes.js";
import { requestLogger } from "./middleware/requestLogger.js";
import authRouter from "./routes/authRouter";
import jobApplicationRouter from "./routes/jobApplicationsAdminRouter";
import jobRolesRouter from "./routes/jobRolesRouter";
import teapotRouter from "./routes/teapotRouter";

const app = express();
const PORT = 4000;
const swaggerDocsEnabled = process.env.ENABLE_SWAGGER_DOCS === "true";

// Middleware
app.use(express.json());
app.use(requestLogger);
registerSwaggerRoutes(app, swaggerDocsEnabled);

app.use("/job-roles", jobRolesRouter);
app.use("/api", authRouter);
app.use("/job-applications/admin", jobApplicationRouter);
app.use("/teapot", teapotRouter);

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

app.get("/", (_req, res) => {
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

app.get("/health", (_req, res) => {
	res.json({ status: "UP", timestamp: new Date().toISOString() });
});

const isMainModule =
	process.argv[1] !== undefined &&
	fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
		console.log(`Try: http://localhost:${PORT}/health`);
		if (swaggerDocsEnabled) {
			console.log(`Swagger docs available at: http://localhost:${PORT}/docs`);
		}
	});
}

export default app;
