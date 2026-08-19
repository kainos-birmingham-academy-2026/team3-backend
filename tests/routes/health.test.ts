import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index.js";

describe("GET /health", () => {
	it("should return 200 OK with status UP", async () => {
		const response = await request(app).get("/health");
		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			status: "UP",
			timestamp: expect.any(String),
		});
	});

	it("should include a valid timestamp", async () => {
		const response = await request(app).get("/health");
		expect(response.body.timestamp).toBeTruthy();
		expect(() => new Date(response.body.timestamp)).not.toThrow();
	});
});
