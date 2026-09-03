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
		expect(specificationResponse.body.paths).toHaveProperty(
			"/job-applications/admin",
		);
		const applicationProperties =
			specificationResponse.body.components.schemas.AdminApplicationListItem
				.properties;
		expect(applicationProperties).toHaveProperty("applicantName");
		expect(applicationProperties).toHaveProperty("roleName");
		expect(applicationProperties).toHaveProperty("applicationDate");
		expect(applicationProperties).toHaveProperty("status");
		expect(applicationProperties).not.toHaveProperty("applicant");
		expect(applicationProperties).not.toHaveProperty("email");
		expect(applicationProperties).not.toHaveProperty("username");
		expect(applicationProperties).not.toHaveProperty("appliedRole");
		expect(applicationProperties).not.toHaveProperty("createdAt");
		expect(documentationResponse.status).toBe(200);
	});
});
