import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import app from "../../src/index.ts";

describe("removed user application APIs", () => {
	let originalJwtSecret: string | undefined;

	const userToken = () =>
		jwt.sign(
			{ userId: 42, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

	beforeEach(() => {
		originalJwtSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "test-secret";
	});

	afterEach(() => {
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	it("does not expose application viewing", async () => {
		const response = await request(app)
			.get("/api/job-applications")
			.set("Authorization", `Bearer ${userToken()}`);

		expect(response.status).toBe(404);
	});

	it("does not expose application withdrawal", async () => {
		const response = await request(app)
			.patch("/api/job-applications/7/status")
			.set("Authorization", `Bearer ${userToken()}`)
			.send({ status: "WITHDRAWN" });

		expect(response.status).toBe(404);
	});
});
