import { describe, expect, it, vi } from "vitest";
import type { AzureOpenAIService } from "../../src/services/azureOpenAIService.js";
import { JobRoleChatService } from "../../src/services/jobRoleChatService.js";
import type { JobRolesService } from "../../src/services/jobRolesService.js";

const roleSummary = (
	jobRoleId: number,
	roleName: string,
	locationName: string,
) => ({
	jobRoleId,
	roleName,
	closingDate: new Date("2026-10-01"),
	capabilityName: "Engineering",
	bandName: "Band 3",
	locationName,
	statusName: "OPEN",
});

const roleDetail = (
	jobRoleId: number,
	roleName: string,
	locationName: string,
) => ({
	...roleSummary(jobRoleId, roleName, locationName),
	description: `${roleName} description`,
	responsibilities: `${roleName} responsibilities`,
	sharepointUrl: "https://example.com/spec",
	numberOfOpenPositions: 2,
	addressLine1: "1 Example Street",
	addressLine2: null,
	postcode: "B1 1AA",
});

describe("JobRoleChatService", () => {
	it("returns no more than three structured role matches", async () => {
		const roles = [
			roleSummary(1, "Software Engineer", "Belfast"),
			roleSummary(2, "Platform Engineer", "Belfast"),
			roleSummary(3, "Test Engineer", "Belfast"),
			roleSummary(4, "Delivery Manager", "Birmingham"),
		];
		const findById = vi.fn(async (jobRoleId: number) => {
			const role = roles.find((item) => item.jobRoleId === jobRoleId);
			if (!role) throw new Error("Role not found");
			return roleDetail(role.jobRoleId, role.roleName, role.locationName);
		});
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue(roles),
			findById,
		} as unknown as JobRolesService;
		const aiService = {
			answer: vi
				.fn()
				.mockResolvedValue("Three roles are available in Belfast."),
		} as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer("Which roles are based in Belfast?");

		expect(findById).toHaveBeenCalledTimes(3);
		expect(findById).not.toHaveBeenCalledWith(4);
		expect(aiService.answer).not.toHaveBeenCalled();
		expect(result.answer).toBe("I found 3 matching roles.");
		expect(result.roles).toEqual([
			expect.objectContaining({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				openPositions: 2,
				status: "OPEN",
			}),
			expect.objectContaining({ jobRoleId: 2, roleName: "Platform Engineer" }),
			expect.objectContaining({ jobRoleId: 3, roleName: "Test Engineer" }),
		]);
	});

	it("prioritises an exact role name", async () => {
		const roles = [
			roleSummary(1, "Software Engineer", "Belfast"),
			roleSummary(2, "Delivery Manager", "Birmingham"),
		];
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue(roles),
			findById: vi.fn(async (jobRoleId: number) => {
				const role =
					roles.find((item) => item.jobRoleId === jobRoleId) ?? roles[0];
				return roleDetail(role.jobRoleId, role.roleName, role.locationName);
			}),
		} as unknown as JobRolesService;
		const aiService = {
			answer: vi.fn().mockResolvedValue("The role closes on 1 October."),
		} as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer("When does Delivery Manager close?");

		expect(result.roles[0]).toEqual(
			expect.objectContaining({
				jobRoleId: 2,
				roleName: "Delivery Manager",
				location: "Birmingham",
			}),
		);
	});

	it("rejects unrelated questions without calling Azure", async () => {
		const jobRolesService = {
			findAll: vi
				.fn()
				.mockResolvedValue([roleSummary(1, "Software Engineer", "Belfast")]),
			findById: vi.fn(),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer("What is the weather today?");

		expect(result).toEqual({
			answer: "I can only help with questions about the available job roles.",
			roles: [],
		});
		expect(jobRolesService.findById).not.toHaveBeenCalled();
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it("allows broad job role questions", async () => {
		const role = roleSummary(1, "Software Engineer", "Belfast");
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue([role]),
			findById: vi
				.fn()
				.mockResolvedValue(roleDetail(1, "Software Engineer", "Belfast")),
		} as unknown as JobRolesService;
		const aiService = {
			answer: vi.fn().mockResolvedValue("The Software Engineer role is open."),
		} as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer("What jobs are open?");

		expect(result.answer).toBe("I found 1 matching role.");
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it("uses Azure for detailed questions about multiple roles", async () => {
		const role = roleSummary(1, "Software Engineer", "Belfast");
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue([role]),
			findById: vi
				.fn()
				.mockResolvedValue(roleDetail(1, "Software Engineer", "Belfast")),
		} as unknown as JobRolesService;
		const aiService = {
			answer: vi
				.fn()
				.mockResolvedValue("The role involves software development."),
		} as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		await service.answer("What responsibilities do these roles have?");

		expect(aiService.answer).toHaveBeenCalledOnce();
	});
});
