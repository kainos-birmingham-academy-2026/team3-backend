import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { jobApplicationAdminController } from "../../src/controllers/jobApplicationAdminController";
import type { JobApplicationAdminService } from "../../src/services/jobApplicationAdminService";

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

describe("jobApplicationAdminController", () => {
	const mockService = {
		findAll: vi.fn(),
		hireApplicant: vi.fn(),
		rejectApplicant: vi.fn(),
	} as unknown as JobApplicationAdminService;

	let controller: jobApplicationAdminController;

	beforeEach(() => {
		vi.resetAllMocks();
		controller = new jobApplicationAdminController(mockService);
	});

	describe("getAll", () => {
		it("should return 200 with applications list", async () => {
			const req = { params: { jobRoleId: "1" } };
			const res = createMockResponse();

			vi.mocked(mockService.findAll).mockResolvedValue([
				{
					applicationId: 1,
					jobRoleId: 1,
					username: "candidate@example.com",
					cvUrl: "cv-1.pdf",
					status: "IN_PROGRESS",
					actions: { canHire: true, canReject: true },
				},
			]);

			await controller.getAll(req as Request, res as unknown as Response);

			expect(mockService.findAll).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith([
				{
					applicationId: 1,
					jobRoleId: 1,
					username: "candidate@example.com",
					cvUrl: "cv-1.pdf",
					status: "IN_PROGRESS",
					actions: { canHire: true, canReject: true },
				},
			]);
		});

		it("should return 500 when service throws", async () => {
			const req = { params: { jobRoleId: "1" } };
			const res = createMockResponse();

			vi.mocked(mockService.findAll).mockRejectedValue(new Error("boom"));

			await controller.getAll(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});

	describe("hire", () => {
		it("should return 200 with updated application payload", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.hireApplicant).mockResolvedValue({
				message: "Applicant hired",
				application: {
					applicationId: 2,
					username: "candidate@example.com",
					status: "HIRED",
				},
			});

			await controller.hire(req as Request, res as unknown as Response);

			expect(mockService.hireApplicant).toHaveBeenCalledWith(1, 2);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: "Applicant hired",
				application: {
					applicationId: 2,
					username: "candidate@example.com",
					status: "HIRED",
				},
			});
		});

		it("should return 404 when application is not found", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.hireApplicant).mockRejectedValue(
				new Error("Application not found"),
			);

			await controller.hire(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "Application not found" });
		});

		it("should return 409 for invalid hire state", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.hireApplicant).mockRejectedValue(
				new Error("Only IN_PROGRESS applications can be hired"),
			);

			await controller.hire(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				message: "Only IN_PROGRESS applications can be hired",
			});
		});

		it("should return 500 for unexpected errors", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.hireApplicant).mockRejectedValue(
				new Error("unexpected"),
			);

			await controller.hire(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});

	describe("reject", () => {
		it("should return 200 with updated application payload", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.rejectApplicant).mockResolvedValue({
				message: "Applicant rejected",
				application: {
					applicationId: 2,
					username: "candidate@example.com",
					status: "REJECTED",
				},
			});

			await controller.reject(req as Request, res as unknown as Response);

			expect(mockService.rejectApplicant).toHaveBeenCalledWith(1, 2);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				message: "Applicant rejected",
				application: {
					applicationId: 2,
					username: "candidate@example.com",
					status: "REJECTED",
				},
			});
		});

		it("should return 404 when application is not found", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.rejectApplicant).mockRejectedValue(
				new Error("Application not found"),
			);

			await controller.reject(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: "Application not found" });
		});

		it("should return 409 for invalid reject state", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.rejectApplicant).mockRejectedValue(
				new Error("Only IN_PROGRESS applications can be rejected"),
			);

			await controller.reject(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				message: "Only IN_PROGRESS applications can be rejected",
			});
		});

		it("should return 500 for unexpected errors", async () => {
			const req = { params: { jobRoleId: "1", applicationId: "2" } };
			const res = createMockResponse();

			vi.mocked(mockService.rejectApplicant).mockRejectedValue(
				new Error("unexpected"),
			);

			await controller.reject(req as Request, res as unknown as Response);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});
});
