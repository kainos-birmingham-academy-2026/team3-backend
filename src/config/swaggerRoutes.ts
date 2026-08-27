import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

export function registerSwaggerRoutes(app: Express, enabled: boolean) {
	if (!enabled) {
		return;
	}

	app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
	app.get("/docs.json", (_req, res) => {
		res.json(swaggerSpec);
	});
}
