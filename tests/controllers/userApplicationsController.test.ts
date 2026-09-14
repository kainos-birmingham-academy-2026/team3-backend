import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserApplicationsController } from "../../src/controllers/userApplicationsController";
import type { JobRolesService } from "../../src/services/jobRolesService";

const createMockResponse = () => {
	const res = {
		locals: { authUser: { userId: 42 } },
		status: vi.fn(),
		send: vi.fn(),
		json: vi.fn(),
	};

	res.status.mockReturnValue(res);
	res.send.mockReturnValue(res);
	res.json.mockReturnValue(res);

	return res;
};

describe("UserApplicationsController", () => {
	const mockJobRolesService = {
		createApplication: vi.fn(),
	};
	let controller: UserApplicationsController;

	beforeEach(() => {
		vi.resetAllMocks();
		controller = new UserApplicationsController(
			mockJobRolesService as unknown as JobRolesService,
		);
	});

	it("creates an application for the authenticated user", async () => {
		const req = { body: { jobRoleId: 3, cvText: "CV-2026-001" } };
		const res = createMockResponse();
		vi.mocked(mockJobRolesService.createApplication).mockResolvedValue({
			applicationId: 7,
			jobRoleId: 3,
			userId: 42,
			cvText: "CV-2026-001",
		});

		await controller.create(
			req as unknown as Request,
			res as unknown as Response,
		);

		expect(mockJobRolesService.createApplication).toHaveBeenCalledWith(3, 42, {
			cvText: "CV-2026-001",
		});
		expect(res.status).toHaveBeenCalledWith(201);
	});
});
