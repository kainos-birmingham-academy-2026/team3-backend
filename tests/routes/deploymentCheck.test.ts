import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index.js";

describe("GET /api/deployment-check", () => {
	it("identifies the selected backend feature image", async () => {
		const response = await request(app).get("/api/deployment-check");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			service: "team3-backend",
			marker: "chore-test-branch-one-backend",
			message: "Selected backend feature image is running",
		});
	});
});
