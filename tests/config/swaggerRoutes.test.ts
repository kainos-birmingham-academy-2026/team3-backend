import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { registerSwaggerRoutes } from "../../src/config/swaggerRoutes.js";

describe("registerSwaggerRoutes", () => {
	it("does not expose Swagger routes when disabled", async () => {
		const app = express();
		registerSwaggerRoutes(app, false);

		const response = await request(app).get("/docs.json");

		expect(response.status).toBe(404);
	});

	it("exposes Swagger routes when enabled", async () => {
		const app = express();
		registerSwaggerRoutes(app, true);

		const specificationResponse = await request(app).get("/docs.json");
		const documentationResponse = await request(app).get("/docs/");

		expect(specificationResponse.status).toBe(200);
		expect(specificationResponse.body).toHaveProperty("openapi");
		expect(documentationResponse.status).toBe(200);
	});
});