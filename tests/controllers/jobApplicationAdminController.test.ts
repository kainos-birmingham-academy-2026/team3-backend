import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobApplicationAdminController } from "../../src/controllers/jobApplicationAdminController";
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
		findAllAdmin: vi.fn(),
		findAll: vi.fn(),
		updateApplicationStatusById: vi.fn(),
	};

	let controller: JobApplicationAdminController;

	beforeEach(() => {
		vi.resetAllMocks();
		controller = new JobApplicationAdminController(
			mockService as unknown as JobApplicationAdminService,
		);
	});

	describe("getAll", () => {
		it("should return 200 with all applications for admin", async () => {
			const req = { params: {} };
			const res = createMockResponse();

			vi.mocked(mockService.findAllAdmin).mockResolvedValue([
				{
					applicationId: 1,
					jobRoleId: 1,
					username: "candidate@example.com",
					status: "IN_PROGRESS",
				},
			]);

			await controller.getAllAdmin(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(mockService.findAllAdmin).toHaveBeenCalled();
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith([
				{
					applicationId: 1,
					jobRoleId: 1,
					username: "candidate@example.com",
					status: "IN_PROGRESS",
				},
			]);
		});

		it("should return 500 when getAllAdmin throws", async () => {
			const req = { params: {} };
			const res = createMockResponse();

			vi.mocked(mockService.findAllAdmin).mockRejectedValue(new Error("boom"));

			await controller.getAllAdmin(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});

		it("should return 200 with applications list", async () => {
			const req = { params: { jobRoleId: "1" } };
			const res = createMockResponse();

			vi.mocked(mockService.findAll).mockResolvedValue([
				{
					applicationId: 1,
					jobRoleId: 1,
					username: "candidate@example.com",
					status: "IN_PROGRESS",
					actions: { canHire: true, canReject: true },
				},
			]);

			await controller.getAll(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(mockService.findAll).toHaveBeenCalledWith(1);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.send).toHaveBeenCalledWith([
				{
					applicationId: 1,
					jobRoleId: 1,
					username: "candidate@example.com",
					status: "IN_PROGRESS",
					actions: { canHire: true, canReject: true },
				},
			]);
		});

		it("should return 500 when service throws", async () => {
			const req = { params: { jobRoleId: "1" } };
			const res = createMockResponse();

			vi.mocked(mockService.findAll).mockRejectedValue(new Error("boom"));

			await controller.getAll(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
		});
	});

	describe("updateStatus", () => {
		it("should return 200 when status update succeeds", async () => {
			const req = {
				params: { applicationId: "2" },
				body: { status: "REJECTED" },
			};
			const res = createMockResponse();

			vi.mocked(mockService.updateApplicationStatusById).mockResolvedValue({
				message: "Applicant rejected",
				application: {
					applicationId: 2,
					username: "candidate@example.com",
					status: "REJECTED",
				},
			});

			await controller.updateStatus(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(mockService.updateApplicationStatusById).toHaveBeenCalledWith(
				2,
				"REJECTED",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});

		it("should return 400 when status field is missing", async () => {
			const req = {
				params: { applicationId: "2" },
				body: {},
			};
			const res = createMockResponse();

			await controller.updateStatus(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(res.status).toHaveBeenCalledWith(400);
			expect(res.json).toHaveBeenCalledWith({
				message:
					"status (or applicationStatus/action/decision/newStatus) is required",
			});
		});

		it("should accept decision field for approved action", async () => {
			const req = {
				params: { applicationId: "2" },
				body: { decision: "APPROVED" },
			};
			const res = createMockResponse();

			vi.mocked(mockService.updateApplicationStatusById).mockResolvedValue({
				message: "Applicant hired",
				application: {
					applicationId: 2,
					username: "candidate@example.com",
					status: "HIRED",
				},
			});

			await controller.updateStatus(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(mockService.updateApplicationStatusById).toHaveBeenCalledWith(
				2,
				"APPROVED",
			);
			expect(res.status).toHaveBeenCalledWith(200);
		});
	});
});
