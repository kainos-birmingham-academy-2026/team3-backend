import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/index.ts";
import { UserApplicationsService } from "../../src/services/userApplicationsService.ts";

describe("User application status API", () => {
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
		vi.restoreAllMocks();
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	it("returns 401 without a bearer token", async () => {
		const response = await request(app)
			.patch("/api/job-applications/7/status")
			.send({ status: "WITHDRAWN" });

		expect(response.status).toBe(401);
	});

	it("withdraws an application with the canonical status request", async () => {
		const withdrawApplication = vi
			.spyOn(UserApplicationsService.prototype, "withdrawApplication")
			.mockResolvedValueOnce({ message: "Application withdrawn" });

		const response = await request(app)
			.patch("/api/job-applications/7/status")
			.set("Authorization", `Bearer ${userToken()}`)
			.send({ status: "WITHDRAWN" });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ message: "Application withdrawn" });
		expect(withdrawApplication).toHaveBeenCalledWith(7, 42);
	});

	it("rejects unsupported user status transitions", async () => {
		const withdrawApplication = vi.spyOn(
			UserApplicationsService.prototype,
			"withdrawApplication",
		);

		const response = await request(app)
			.patch("/api/job-applications/7/status")
			.set("Authorization", `Bearer ${userToken()}`)
			.send({ status: "HIRED" });

		expect(response.status).toBe(400);
		expect(withdrawApplication).not.toHaveBeenCalled();
	});
});
