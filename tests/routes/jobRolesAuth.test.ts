import { NotFoundError } from "error-lib";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError } from "../../src/errors/conflictError.js";
import app from "../../src/index.ts";
import type { JobRoleResponse } from "../../src/models/jobRoleResponse.ts";
import { JobRolesService } from "../../src/services/jobRolesService.ts";

describe("Job role route auth protection", () => {
	let originalJwtSecret: string | undefined;

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

	it("should return 200 without bearer token on list endpoint", async () => {
		vi.spyOn(JobRolesService.prototype, "findAll").mockResolvedValueOnce({
			items: [],
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		});

		const response = await request(app).get("/api/job-roles");

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			items: [],
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		});
	});

	it("should validate and pass list filters to the service", async () => {
		const findAll = vi
			.spyOn(JobRolesService.prototype, "findAll")
			.mockResolvedValueOnce({
				items: [],
				page: 2,
				pageSize: 5,
				totalItems: 0,
				totalPages: 0,
			});

		const response = await request(app).get(
			"/api/job-roles?roleName=engineer&locationId=1&locationId=2&capabilityId=3&bandId=4&closingDateFrom=2026-09-01&page=2&pageSize=5",
		);

		expect(response.status).toBe(200);
		expect(findAll).toHaveBeenCalledWith({
			roleName: "engineer",
			locationId: [1, 2],
			capabilityId: [3],
			bandId: [4],
			closingDateFrom: "2026-09-01",
			page: 2,
			pageSize: 5,
		});
	});

	it("should return 400 when both closing date filters are supplied", async () => {
		const response = await request(app).get(
			"/api/job-roles?closingDateFrom=2026-09-01&closingDateTo=2026-12-31",
		);

		expect(response.status).toBe(400);
		expect(response.body.errors[0]).toEqual(
			expect.objectContaining({
				field: "closingDateTo",
				message: "Choose either closing on or after or closing on or before",
			}),
		);
	});

	it("should return 400 for invalid list filters", async () => {
		const response = await request(app).get(
			"/api/job-roles?locationId=invalid",
		);

		expect(response.status).toBe(400);
		expect(response.body.errors[0].field).toBe("locationId.0");
	});

	it("should return 200 without bearer token on detail endpoint", async () => {
		vi.spyOn(JobRolesService.prototype, "findById").mockResolvedValueOnce({
			jobRoleId: 1,
			roleName: "Engineer",
			capabilityName: "Software",
			bandName: "Band 1",
			locationName: "Singapore",
			closingDate: new Date("2026-08-01T00:00:00.000Z"),
			statusName: "OPEN",
			description: "Role description",
			responsibilities: "Role responsibilities",
			sharepointUrl: "https://example.com/spec",
			numberOfOpenPositions: 2,
			addressLine1: "123 Street",
			addressLine2: "Unit 1",
			postcode: "S1 1AA",
		});

		const response = await request(app).get("/api/job-roles/1");

		expect(response.status).toBe(200);
		expect(response.body.jobRoleId).toBe(1);
		expect(response.body.roleName).toBe("Engineer");
	});

	it.each([
		["statuses", "getStatus", [{ statusId: 1, statusName: "OPEN" }]],
		["bands", "getBands", [{ bandId: 2, bandName: "Engineer" }]],
		[
			"capabilities",
			"getCapabilities",
			[{ capabilityId: 3, capabilityName: "Software" }],
		],
		[
			"locations",
			"getLocations",
			[{ locationId: 4, locationName: "Birmingham" }],
		],
	] as const)(
		"should return lookup data from the /api/job-roles/%s endpoint",
		async (path, method, data) => {
			vi.spyOn(JobRolesService.prototype, method).mockResolvedValueOnce(
				data as never,
			);

			const response = await request(app).get(`/api/job-roles/${path}`);

			expect(response.status).toBe(200);
			expect(response.body).toEqual(data);
		},
	);

	it("should return 200 with user token on list endpoint", async () => {
		const serviceItems: JobRoleResponse[] = [
			{
				jobRoleId: 1,
				roleName: "Engineer",
				capabilityName: "Software",
				bandName: "Band 1",
				locationName: "Singapore",
				closingDate: new Date("2026-08-01T00:00:00.000Z"),
				statusName: "OPEN",
			},
		];

		const expectedItems = [
			{
				jobRoleId: 1,
				roleName: "Engineer",
				capabilityName: "Software",
				bandName: "Band 1",
				locationName: "Singapore",
				closingDate: "2026-08-01T00:00:00.000Z",
				statusName: "OPEN",
			},
		];

		vi.spyOn(JobRolesService.prototype, "findAll").mockResolvedValueOnce({
			items: serviceItems,
			page: 1,
			pageSize: 10,
			totalItems: 1,
			totalPages: 1,
		});

		const token = jwt.sign(
			{ userId: 1, email: "test1@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.get("/api/job-roles")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			items: expectedItems,
			page: 1,
			pageSize: 10,
			totalItems: 1,
			totalPages: 1,
		});
	});

	it("should return 200 with admin token on list endpoint", async () => {
		const expected = {
			items: [] as JobRoleResponse[],
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 0,
		};

		vi.spyOn(JobRolesService.prototype, "findAll").mockResolvedValueOnce(
			expected,
		);

		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.get("/api/job-roles")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it("should return 403 for user token on create endpoint", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "test1@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const payload = {
			roleName: "Mock Role",
			description: "Mock role description",
			responsibilities: "Mock responsibilities",
			sharepointUrl: "https://example.com/roles/mock-role",
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 1,
			locationId: 1,
		};

		const response = await request(app)
			.post("/api/job-roles")
			.set("Authorization", `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: "Forbidden" });
	});

	it("should return 201 for admin token on create endpoint", async () => {
		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const payload = {
			roleName: "Mock Role",
			description: "Mock role description",
			responsibilities: "Mock responsibilities",
			sharepointUrl: "https://example.com/roles/mock-role",
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 1,
			locationId: 1,
		};
		const createdJobRole: JobRoleResponse = {
			jobRoleId: 1,
			roleName: "Mock Role",
			capabilityName: "Software",
			bandName: "Band 1",
			locationName: "Birmingham",
			closingDate: null,
			statusName: "OPEN",
		};

		vi.spyOn(JobRolesService.prototype, "createJobRole").mockResolvedValueOnce(
			createdJobRole,
		);

		const response = await request(app)
			.post("/api/job-roles")
			.set("Authorization", `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			...createdJobRole,
			closingDate: null,
		});
	});

	it("should return 400 when create payload is invalid", async () => {
		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.post("/api/job-roles")
			.set("Authorization", `Bearer ${token}`)
			.send({ roleName: "" });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.any(Array),
		});
	});

	it("should return 200 when an admin updates a valid job role", async () => {
		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);
		const payload = {
			roleName: "Lead Engineer",
			description: "Lead software delivery",
			responsibilities: "Coach the engineering team",
			sharepointUrl: "https://example.com/roles/lead-engineer",
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 2,
			locationId: 3,
		};
		vi.spyOn(JobRolesService.prototype, "updateJobRole").mockResolvedValueOnce({
			jobRoleId: 1,
			...payload,
			closingDate: null,
			capabilityName: "Software",
			bandName: "Lead",
			locationName: "Birmingham",
			statusName: "OPEN",
			addressLine1: "1 Street",
			addressLine2: null,
			postcode: "B1 1AA",
		});

		const response = await request(app)
			.patch("/api/job-roles/1")
			.set("Authorization", `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(200);
		expect(response.body.roleName).toBe("Lead Engineer");
	});

	it("should reject invalid update data before calling the service", async () => {
		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);
		const updateSpy = vi.spyOn(JobRolesService.prototype, "updateJobRole");

		const response = await request(app)
			.patch("/api/job-roles/1")
			.set("Authorization", `Bearer ${token}`)
			.send({ roleName: "" });

		expect(response.status).toBe(400);
		expect(response.body.errors).toEqual(expect.any(Array));
		expect(updateSpy).not.toHaveBeenCalled();
	});

	it("should forbid non-admin users from updating a job role", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.patch("/api/job-roles/1")
			.set("Authorization", `Bearer ${token}`)
			.send({});

		expect(response.status).toBe(403);
	});

	it("should delete a job role for an admin", async () => {
		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);
		const deleteSpy = vi
			.spyOn(JobRolesService.prototype, "deleteJobRole")
			.mockResolvedValueOnce();

		const response = await request(app)
			.delete("/api/job-roles/1")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(204);
		expect(deleteSpy).toHaveBeenCalledWith(1);
	});

	it("should forbid non-admin users from deleting a job role", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.delete("/api/job-roles/1")
			.set("Authorization", `Bearer ${token}`);

		expect(response.status).toBe(403);
	});
});

describe("POST /api/job-applications", () => {
	let originalJwtSecret: string | undefined;

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

	it("should return 401 without bearer token", async () => {
		const response = await request(app)
			.post("/api/job-applications")
			.send({ jobRoleId: 1, cvText: "CV-2026-001" });

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid token" });
	});

	it("should return 400 for invalid job role id", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.post("/api/job-applications")
			.set("Authorization", `Bearer ${token}`)
			.send({ jobRoleId: "abc", cvText: "CV-2026-001" });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "jobRoleId",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should return 400 when cv text is empty", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		const response = await request(app)
			.post("/api/job-applications")
			.set("Authorization", `Bearer ${token}`)
			.send({ jobRoleId: 1, cvText: "" });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "cvText",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should return 201 when user successfully applies for job role", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		vi.spyOn(
			JobRolesService.prototype,
			"createApplication",
		).mockResolvedValueOnce({
			applicationId: 1,
			jobRoleId: 1,
			userId: 1,
			cvText: "CV-2026-001",
		});

		const response = await request(app)
			.post("/api/job-applications")
			.set("Authorization", `Bearer ${token}`)
			.send({ jobRoleId: 1, cvText: "CV-2026-001" });

		expect(response.status).toBe(201);
		expect(response.body).toSatisfy(
			(value) =>
				value.applicationId === 1 &&
				value.jobRoleId === 1 &&
				value.userId === 1 &&
				value.cvText === "CV-2026-001",
		);
	});

	it("should return 404 when job role does not exist", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		vi.spyOn(
			JobRolesService.prototype,
			"createApplication",
		).mockRejectedValueOnce(new NotFoundError("JobRole with id 999 not found"));

		const response = await request(app)
			.post("/api/job-applications")
			.set("Authorization", `Bearer ${token}`)
			.send({ jobRoleId: 999, cvText: "CV-2026-001" });

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ message: "JobRole with id 999 not found" });
	});

	it("should return 409 when user has already applied for the job role", async () => {
		const token = jwt.sign(
			{ userId: 1, email: "user@example.com", role: "USER" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		vi.spyOn(
			JobRolesService.prototype,
			"createApplication",
		).mockRejectedValueOnce(
			new ConflictError(
				409,
				"User with id 1 has already applied for JobRole with id 1",
			),
		);

		const response = await request(app)
			.post("/api/job-applications")
			.set("Authorization", `Bearer ${token}`)
			.send({ jobRoleId: 1, cvText: "CV-2026-001" });

		expect(response.status).toBe(409);
		expect(response.body).toEqual({
			message: "User with id 1 has already applied for JobRole with id 1",
		});
	});

	it("should allow admin users to apply for job roles", async () => {
		const token = jwt.sign(
			{ userId: 2, email: "admin@example.com", role: "ADMIN" },
			process.env.JWT_SECRET as string,
			{ expiresIn: "1h" },
		);

		vi.spyOn(
			JobRolesService.prototype,
			"createApplication",
		).mockResolvedValueOnce({
			applicationId: 2,
			jobRoleId: 1,
			userId: 2,
			cvText: "CV-2026-002",
		});

		const response = await request(app)
			.post("/api/job-applications")
			.set("Authorization", `Bearer ${token}`)
			.send({ jobRoleId: 1, cvText: "CV-2026-002" });

		expect(response.status).toBe(201);
		expect(response.body).toSatisfy((value) => value.userId === 2);
	});
});
