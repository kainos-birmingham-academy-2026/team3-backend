import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserApplicationsService } from "../../src/services/userApplicationsService";

const { mockFindFirst, mockUpdateMany } = vi.hoisted(() => ({
	mockFindFirst: vi.fn(),
	mockUpdateMany: vi.fn(),
}));

vi.mock("../../src/prismaClient.ts", () => ({
	default: {
		application: {
			findFirst: mockFindFirst,
			updateMany: mockUpdateMany,
		},
	},
}));

describe("UserApplicationsService", () => {
	const service = new UserApplicationsService();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("withdraws an in-progress application owned by the user", async () => {
		mockFindFirst.mockResolvedValue({ applicationStatus: "IN_PROGRESS" });
		mockUpdateMany.mockResolvedValue({ count: 1 });

		await expect(service.withdrawApplication(7, 42)).resolves.toEqual({
			message: "Application withdrawn",
		});
		expect(mockFindFirst).toHaveBeenCalledWith({
			where: { applicationId: 7, userId: 42 },
			select: { applicationStatus: true },
		});
		expect(mockUpdateMany).toHaveBeenCalledWith({
			where: { applicationId: 7, userId: 42, applicationStatus: "IN_PROGRESS" },
			data: { applicationStatus: "WITHDRAWN" },
		});
	});

	it("does not disclose an application owned by another user", async () => {
		mockFindFirst.mockResolvedValue(null);

		await expect(service.withdrawApplication(7, 42)).rejects.toThrow(
			"Application not found",
		);
		expect(mockUpdateMany).not.toHaveBeenCalled();
	});

	it("does not withdraw an application that is no longer in progress", async () => {
		mockFindFirst.mockResolvedValue({ applicationStatus: "HIRED" });

		await expect(service.withdrawApplication(7, 42)).rejects.toThrow(
			"Only IN_PROGRESS applications can be withdrawn",
		);
		expect(mockUpdateMany).not.toHaveBeenCalled();
	});
});
