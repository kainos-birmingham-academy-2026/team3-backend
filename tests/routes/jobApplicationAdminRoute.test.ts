import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/index.ts";
import { JobApplicationAdminService } from "../../src/services/jobApplicationAdminService.ts";

describe("Admin hire API behaviour", () => {
	let originalJwtSecret: string | undefined;

	const adminToken = () =>
		jwt.sign(
			{ userId: 9, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

	const userToken = () =>
		jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
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

    it("Given the absence of a token, when the admin applications route is requested, then the status code should be 401", async () => {
     const response = (await request(app).get("/job-applications/admin"));
     expect(response.status).toBe(401);
    });

	it("Given a non-admin token, when the admin applications route is requested, then the request is forbidden", async () => {
		const response = await request(app).get("/job-applications/admin").set("Authorization", `Bearer ${userToken()}`);

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: "Forbidden" });
	});

	it("Given an admin token, when the applications are requested, then the list of applications is returned", async () => {
		const applications = [
			{
				applicationId: 7,
				jobRoleId: 3,
				applicant: "candidate@example.com",
				applicantName: "candidate@example.com",
				email: "candidate@example.com",
				appliedRole: "Software Engineer",
				roleName: "Software Engineer",
				applicationDate: "2026-08-12T10:00:00.000Z",
				createdAt: "2026-08-12T10:00:00.000Z",
				username: "candidate@example.com",
				cvText: "cv text",
				status: "IN_PROGRESS",
				actions: { canHire: true, canReject: true },
			},
		];

		vi.spyOn(JobApplicationAdminService.prototype, "findAllAdmin").mockResolvedValueOnce(
			applications as never,
		);

		const response = await request(app).get("/job-applications/admin").set("Authorization", `Bearer ${adminToken()}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual(applications);
	});

	it("Given an admin token, when a valid hire status is sent, then the application is successfully hired", async () => {
		vi.spyOn(
			JobApplicationAdminService.prototype,
			"updateApplicationStatusById",
		).mockResolvedValueOnce({
			message: "Applicant hired",
			application: {
				applicationId: 7,
				username: "candidate@example.com",
				status: "HIRED",
			},
		} as never);

		const response = await request(app)
			.patch("/job-applications/admin/2/status")
			.set("Authorization", `Bearer ${adminToken()}`)
			.send({ status: "HIRED" });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			message: "Applicant hired",
			application: {
				applicationId: 2,
				username: "test@example.com",
				status: "HIRED",
			},
		});
	});

	it("Given an unsupported status, when the admin attempts to update the application, then a 400 response is returned", async () => {
		vi.spyOn(
			JobApplicationAdminService.prototype,
			"updateApplicationStatusById",
		).mockRejectedValueOnce(new Error("Unsupported application status"));

		const response = await request(app)
			.patch("/job-applications/admin/7/status")
			.set("Authorization", `Bearer ${adminToken()}`)
			.send({ status: "PENDING" });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			message: "Unsupported status. Use HIRED/APPROVED or REJECTED",
		});
	});
});
