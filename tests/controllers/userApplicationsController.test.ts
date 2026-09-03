import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserApplicationsController } from "../../src/controllers/userApplicationsController";
import type { UserApplicationsService } from "../../src/services/userApplicationsService";

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
	const mockService = {
		findAllForUser: vi.fn(),
		withdrawApplication: vi.fn(),
	};
	let controller: UserApplicationsController;

	beforeEach(() => {
		vi.resetAllMocks();
		controller = new UserApplicationsController(
			mockService as unknown as UserApplicationsService,
		);
	});

	it("withdraws an application owned by the authenticated user", async () => {
		const req = { params: { applicationId: "7" } };
		const res = createMockResponse();
		vi.mocked(mockService.withdrawApplication).mockResolvedValue({
			message: "Application withdrawn",
		});

		await controller.withdraw(
			req as unknown as Request,
			res as unknown as Response,
		);

		expect(mockService.withdrawApplication).toHaveBeenCalledWith(7, 42);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.json).toHaveBeenCalledWith({ message: "Application withdrawn" });
	});

	it("returns 409 when the application cannot be withdrawn", async () => {
		const req = { params: { applicationId: "7" } };
		const res = createMockResponse();
		vi.mocked(mockService.withdrawApplication).mockRejectedValue(
			new Error("Only IN_PROGRESS applications can be withdrawn"),
		);

		await controller.withdraw(
			req as unknown as Request,
			res as unknown as Response,
		);

		expect(res.status).toHaveBeenCalledWith(409);
		expect(res.json).toHaveBeenCalledWith({
			message: "Only IN_PROGRESS applications can be withdrawn",
		});
	});

	it("returns applications for the authenticated user", async () => {
		const req = {};
		const res = createMockResponse();
		const applications = [{ applicationId: 1, status: "IN_PROGRESS" }];
		vi.mocked(mockService.findAllForUser).mockResolvedValue(applications);

		await controller.getAll(
			req as Request,
			res as unknown as Response,
		);

		expect(mockService.findAllForUser).toHaveBeenCalledWith(42);
		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith(applications);
	});

	it("returns 500 when the service fails", async () => {
		const req = {};
		const res = createMockResponse();
		vi.mocked(mockService.findAllForUser).mockRejectedValue(new Error("boom"));

		await controller.getAll(
			req as Request,
			res as unknown as Response,
		);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
	});
});