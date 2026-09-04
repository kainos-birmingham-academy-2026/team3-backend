import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../../src/index.js";

describe("job role chat route", () => {
	it.each([
		["an empty message", { message: "" }],
		["an oversized message", { message: "a".repeat(501) }],
		["conversation history", { message: "What is open?", history: [] }],
	])("returns 400 for %s", async (_description, body) => {
		const response = await request(app).post("/api/job-role-chat").send(body);

		expect(response.status).toBe(400);
		expect(response.body.errors).toBeInstanceOf(Array);
	});
});