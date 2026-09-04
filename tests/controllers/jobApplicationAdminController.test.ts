import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobApplicationAdminController } from "../../src/controllers/jobApplicationAdminController";
import type { JobApplicationAdminService } from "../../src/services/jobApplicationAdminService";

const createMockResponse = () => {
	const res = {
		locals: {
			validatedQuery: {
				jobRoleId: undefined as number | undefined,
				page: 1,
				pageSize: 10,
			},
		},
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

			vi.mocked(mockService.findAllAdmin).mockResolvedValue({
				items: [
					{
						applicationId: 1,
						jobRoleId: 1,
						applicantEmail: "candidate@example.com",
						status: "IN_PROGRESS",
					},
				],
				page: 1,
				pageSize: 10,
				totalItems: 1,
				totalPages: 1,
			});

			await controller.getAllAdmin(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(mockService.findAllAdmin).toHaveBeenCalledWith({
				jobRoleId: undefined,
				page: 1,
				pageSize: 10,
			});
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({
				items: [
					{
						applicationId: 1,
						jobRoleId: 1,
						applicantEmail: "candidate@example.com",
						status: "IN_PROGRESS",
					},
				],
				page: 1,
				pageSize: 10,
				totalItems: 1,
				totalPages: 1,
			});
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
			expect(res.json).toHaveBeenCalledWith({
				message: "Internal server error",
			});
		});

		it("should return 200 with applications filtered by job role", async () => {
			const req = {};
			const res = createMockResponse();
			res.locals.validatedQuery = { jobRoleId: 1, page: 2, pageSize: 5 };

			vi.mocked(mockService.findAllAdmin).mockResolvedValue({
				items: [
					{
						applicationId: 1,
						jobRoleId: 1,
						applicantEmail: "candidate@example.com",
						status: "IN_PROGRESS",
						actions: { canHire: true, canReject: true },
					},
				],
				page: 2,
				pageSize: 5,
				totalItems: 6,
				totalPages: 2,
			});

			await controller.getAllAdmin(
				req as unknown as Request,
				res as unknown as Response,
			);

			expect(mockService.findAllAdmin).toHaveBeenCalledWith({
				jobRoleId: 1,
				page: 2,
				pageSize: 5,
			});
			expect(res.status).toHaveBeenCalledWith(200);
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
					applicantEmail: "candidate@example.com",
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
	});
});
