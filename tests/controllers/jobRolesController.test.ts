import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobRolesController } from "../../src/controllers/jobRolesController.js";
import { NotFoundError } from "error-lib";
import { ConflictError } from "../../src/errors/conflictError.js";
import type { JobRolesService } from "../../src/services/jobRolesService.js";
import type { Request, Response } from "express";

const CREATED_AT = new Date("2026-01-01T10:00:00.000Z");
const UPDATED_AT = new Date("2026-01-02T10:00:00.000Z");

const createMockResponse = () => {
	const res = {
		status: vi.fn(),
		send: vi.fn(),
		json: vi.fn(),
	};

	res.status.mockReturnValue(res);
	res.send.mockReturnValue(res);
	res.json.mockReturnValue(res);

	return res;
};

describe("JobRolesController", () => {
	const mockService = {
		findAll: vi.fn(),
		findById: vi.fn(),
		createApplication: vi.fn(),
	} as unknown as JobRolesService;

	let controller: JobRolesController;

	beforeEach(() => {
		vi.resetAllMocks();
		controller = new JobRolesController(mockService);
	});

	describe("getAll", () => {
		it("should return 200 with the job roles array", async () => {
			const req = {};
			const res = createMockResponse();

			vi.mocked(mockService.findAll).mockResolvedValue([
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					closingDate: new Date("2026-12-31"),
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					locationName: "Birmingham",
					statusName: "OPEN",
				},
			]);

			await controller.getAll(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(200);
			const [payload] = vi.mocked(res.send).mock.calls.at(-1) ?? [];
			expect(payload).toSatisfy(
				(value) =>
					Array.isArray(value) &&
					value.length === 1 &&
					value[0].jobRoleId === 1 &&
					value[0].roleName === "Software Engineer" &&
					value[0].locationName === "Birmingham",
			);
		});

		it("should return 500 when the service throws", async () => {
			const req = {};
			const res = createMockResponse();

			vi.mocked(mockService.findAll).mockRejectedValue(new Error("boom"));

			await controller.getAll(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});

	describe("getById", () => {
		it("should return 200 when the job role is found", async () => {
			const req = { params: { id: "1" } };
			const res = createMockResponse();

			vi.mocked(mockService.findById).mockResolvedValue({
				jobRoleId: 1,
				roleName: "Software Engineer",
				description: "Build and maintain software systems",
				responsibilities: "Code development, testing, deployment",
				sharepointUrl: "https://sharepoint.example.com/roles/1",
				numberOfOpenPositions: 2,
				closingDate: new Date("2026-12-31"),
				capabilityName: "Software Engineering",
				bandName: "Engineer",
				locationName: "Birmingham",
				statusName: "OPEN",
				addressLine1: "123 Street",
				addressLine2: null,
				postcode: "B1 1AA",
			});

			await controller.getById(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(200);
			const [payload] = vi.mocked(res.send).mock.calls.at(-1) ?? [];
			expect(payload).toSatisfy(
				(value) =>
					value.jobRoleId === 1 &&
					value.roleName === "Software Engineer" &&
					value.locationName === "Birmingham",
			);
		});

		it("should return 404 when the job role is not found", async () => {
			const req = { params: { id: "999" } };
			const res = createMockResponse();

			vi.mocked(mockService.findById).mockRejectedValue(new NotFoundError("JobRole with id 999 not found"));

			await controller.getById(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ error: "JobRole with id 999 not found" });
		});

		it("should return 400 when the id is invalid", async () => {
			const req = { params: { id: "abc" } };
			const res = createMockResponse();

			await controller.getById(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid job role ID" });
		});

		it("should return 500 when the service throws", async () => {
			const req = { params: { id: "1" } };
			const res = createMockResponse();

			vi.mocked(mockService.findById).mockRejectedValue(new Error("boom"));

			await controller.getById(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});

	describe("createMock", () => {
		it("should return 201 and enforce OPEN status in draft response", async () => {
			const req = {
				body: {
					roleName: "Software Engineer",
					description: "Build and maintain software systems",
					responsibilities: "Code development, testing, deployment",
					sharepointUrl: "https://sharepoint.example.com/roles/1",
					numberOfOpenPositions: 2,
					capabilityId: 1,
					bandId: 1,
					locationId: 1,
				},
			};
			const res = createMockResponse();

			await controller.createMock(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({
				message: "Mock create endpoint accepted",
				jobRoleDraft: {
					...req.body,
					statusName: "OPEN",
				},
			});
		});
	});

	describe("createApplication", () => {
		it("should return 201 with application data when application is created successfully", async () => {
			const req = {
				params: { id: "1" },
				body: { cvReference: "CV-2026-001" },
			};
			const res = createMockResponse();
			res.locals = { authUser: { userId: 1 } };

			vi.mocked(mockService.createApplication).mockResolvedValue({
				applicationId: 1,
				jobRoleId: 1,
				userId: 1,
				cvReference: "CV-2026-001",
			});

			await controller.createApplication(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(201);
			const [payload] = vi.mocked(res.json).mock.calls.at(-1) ?? [];
			expect(payload).toSatisfy(
				(value) =>
					value.applicationId === 1 &&
					value.jobRoleId === 1 &&
					value.userId === 1 &&
					value.cvReference === "CV-2026-001",
			);
		});

		it("should return 404 when job role does not exist", async () => {
			const req = {
				params: { id: "999" },
				body: { cvReference: "CV-2026-001" },
			};
			const res = createMockResponse();
			res.locals = { authUser: { userId: 1 } };

			vi.mocked(mockService.createApplication).mockRejectedValue(
				new NotFoundError("JobRole with id 999 not found"),
			);

			await controller.createApplication(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({
				error: "JobRole with id 999 not found",
			});
		});

		it("should return 409 when user has already applied for the job role", async () => {
			const req = {
				params: { id: "1" },
				body: { cvReference: "CV-2026-001" },
			};
			const res = createMockResponse();
			res.locals = { authUser: { userId: 1 } };

			vi.mocked(mockService.createApplication).mockRejectedValue(
				new ConflictError(409, "User with id 1 has already applied for JobRole with id 1"),
			);

			await controller.createApplication(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				error: "User with id 1 has already applied for JobRole with id 1",
			});
		});

		it("should return 401 when user is not authenticated", async () => {
			const req = {
				params: { id: "1" },
				body: { cvReference: "CV-2026-001" },
			};
			const res = createMockResponse();
			res.locals = { authUser: undefined };

			await controller.createApplication(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
		});

		it("should return 500 when an unexpected error occurs", async () => {
			const req = {
				params: { id: "1" },
				body: { cvReference: "CV-2026-001" },
			};
			const res = createMockResponse();
			res.locals = { authUser: { userId: 1 } };

			vi.mocked(mockService.createApplication).mockRejectedValue(new Error("Database error"));

			await controller.createApplication(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});
});
