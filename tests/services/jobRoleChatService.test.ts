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
		expect(result.answer).toBe("Here are 3 roles.");
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

	it("does not return closed roles to applicants", async () => {
		const openRole = roleSummary(1, "Software Engineer", "Belfast");
		const closedRole = {
			...roleSummary(2, "Delivery Manager", "Belfast"),
			statusName: "CLOSED",
		};
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue([openRole, closedRole]),
			findById: vi
				.fn()
				.mockResolvedValue(
					roleDetail(1, openRole.roleName, openRole.locationName),
				),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer("roles in Belfast");

		expect(result.answer).toBe("Here is 1 role.");
		expect(result.roles).toEqual([
			expect.objectContaining({
				jobRoleId: 1,
				roleName: "Software Engineer",
				status: "OPEN",
			}),
		]);
		expect(jobRolesService.findById).toHaveBeenCalledOnce();
		expect(jobRolesService.findById).not.toHaveBeenCalledWith(2);
		expect(aiService.answer).not.toHaveBeenCalled();
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

		expect(result.answer).toBe("Here is 1 role.");
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it("handles a generic singular role prompt without calling Azure", async () => {
		const role = roleSummary(1, "Software Engineer", "Belfast");
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue([role]),
			findById: vi
				.fn()
				.mockResolvedValue(roleDetail(1, "Software Engineer", "Belfast")),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer("role");

		expect(result.answer).toBe("Here is 1 role.");
		expect(result.roles).toHaveLength(1);
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it.each([
		["band", "Available bands: Associate, Senior Engineer."],
		["capabilities", "Available capabilities: Data & AI, Engineering."],
		["location", "Available locations: Belfast, London."],
		["statuses", "Available statuses: OPEN."],
	])(
		"lists available metadata locally for a generic %s prompt",
		async (message, expectedAnswer) => {
			const roles = [
				{
					...roleSummary(1, "Software Engineer", "Belfast"),
					bandName: "Associate",
					capabilityName: "Engineering",
				},
				{
					...roleSummary(2, "Data Analyst", "London"),
					bandName: "Senior Engineer",
					capabilityName: "Data & AI",
				},
				{
					...roleSummary(3, "Former Consultant", "Manchester"),
					bandName: "Principal",
					capabilityName: "Consulting",
					statusName: "CLOSED",
				},
			];
			const jobRolesService = {
				findAll: vi.fn().mockResolvedValue(roles),
				findById: vi.fn(),
			} as unknown as JobRolesService;
			const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
			const service = new JobRoleChatService(jobRolesService, aiService);

			const result = await service.answer(message);

			expect(result).toEqual({ answer: expectedAnswer, roles: [] });
			expect(jobRolesService.findById).not.toHaveBeenCalled();
			expect(aiService.answer).not.toHaveBeenCalled();
		},
	);

	it.each([
		"application",
		"benefits",
		"closing date",
		"description",
		"requirements",
		"responsibilities",
		"salary",
	])("asks for a role when a detail topic is vague: %s", async (message) => {
		const jobRolesService = {
			findAll: vi
				.fn()
				.mockResolvedValue([roleSummary(1, "Software Engineer", "Belfast")]),
			findById: vi.fn(),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer(message);

		expect(result).toEqual({
			answer: "Which role would you like to know about?",
			roles: [],
		});
		expect(jobRolesService.findById).not.toHaveBeenCalled();
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it.each(["open", "careers"])(
		"handles a generic discovery term locally: %s",
		async (message) => {
			const role = roleSummary(1, "Software Engineer", "Belfast");
			const jobRolesService = {
				findAll: vi.fn().mockResolvedValue([role]),
				findById: vi
					.fn()
					.mockResolvedValue(roleDetail(1, role.roleName, role.locationName)),
			} as unknown as JobRolesService;
			const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
			const service = new JobRoleChatService(jobRolesService, aiService);

			const result = await service.answer(message);

			expect(result.answer).toBe("Here is 1 role.");
			expect(result.roles).toHaveLength(1);
			expect(aiService.answer).not.toHaveBeenCalled();
		},
	);

	it.each(["Birmingham", "Band 3", "Engineering", "OPEN", "Software Engineer"])(
		"handles a bare known role value locally: %s",
		async (message) => {
			const role = roleSummary(1, "Software Engineer", "Birmingham");
			const jobRolesService = {
				findAll: vi.fn().mockResolvedValue([role]),
				findById: vi
					.fn()
					.mockResolvedValue(roleDetail(1, role.roleName, role.locationName)),
			} as unknown as JobRolesService;
			const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
			const service = new JobRoleChatService(jobRolesService, aiService);

			const result = await service.answer(message);

			expect(result.answer).toBe("Here is 1 role.");
			expect(result.roles).toHaveLength(1);
			expect(aiService.answer).not.toHaveBeenCalled();
		},
	);

	it.each([
		["What jobs are available in Norway?", "Norway"],
		["Show me open jobs near Norway", null],
	])(
		"returns no roles when a requested location has no matches: %s",
		async (message, location) => {
			const jobRolesService = {
				findAll: vi
					.fn()
					.mockResolvedValue([
						roleSummary(1, "Senior Software Engineer", "Glasgow"),
						roleSummary(2, "Associate Software Engineer", "London"),
						roleSummary(3, "Trainee Software Engineer", "Belfast"),
					]),
				findById: vi.fn(),
			} as unknown as JobRolesService;
			const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
			const service = new JobRoleChatService(jobRolesService, aiService);

			const result = await service.answer(message);

			expect(result).toEqual({
				answer: location
					? `I couldn't find any jobs in ${location}.`
					: "I couldn't find any matching roles.",
				roles: [],
			});
			expect(jobRolesService.findById).not.toHaveBeenCalled();
			expect(aiService.answer).not.toHaveBeenCalled();
		},
	);

	it.each([
		"What jobs are in Belfast or London?",
		"What jobs are in Belfast right now?",
	])("supports natural location filtering: %s", async (message) => {
		const roles = [
			roleSummary(1, "Software Engineer", "Belfast"),
			roleSummary(2, "Platform Engineer", "London"),
		];
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue(roles),
			findById: vi.fn(async (jobRoleId: number) => {
				const role = roles.find((item) => item.jobRoleId === jobRoleId);
				if (!role) throw new Error("Role not found");
				return roleDetail(role.jobRoleId, role.roleName, role.locationName);
			}),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer(message);

		expect(result.roles.length).toBeGreaterThan(0);
		expect(
			result.roles.every((role) =>
				["Belfast", "London"].includes(role.location),
			),
		).toBe(true);
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it("requires every requested filter category to match", async () => {
		const roles = [
			roleSummary(1, "Software Engineer", "Belfast"),
			roleSummary(2, "Software Engineer", "London"),
			{
				...roleSummary(3, "Software Engineer", "Belfast"),
				statusName: "CLOSED",
			},
			roleSummary(4, "Delivery Manager", "Belfast"),
		];
		const jobRolesService = {
			findAll: vi.fn().mockResolvedValue(roles),
			findById: vi.fn(async (jobRoleId: number) => {
				const role = roles.find((item) => item.jobRoleId === jobRoleId);
				if (!role) throw new Error("Role not found");
				return {
					...roleDetail(role.jobRoleId, role.roleName, role.locationName),
					statusName: role.statusName,
				};
			}),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer(
			"What open Software Engineer jobs are in Belfast?",
		);

		expect(result.roles).toEqual([
			expect.objectContaining({
				jobRoleId: 1,
				roleName: "Software Engineer",
				location: "Belfast",
				status: "OPEN",
			}),
		]);
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it("does not use unrelated roles for an unknown detailed role", async () => {
		const jobRolesService = {
			findAll: vi
				.fn()
				.mockResolvedValue([roleSummary(1, "Software Engineer", "Belfast")]),
			findById: vi.fn(),
		} as unknown as JobRolesService;
		const aiService = { answer: vi.fn() } as unknown as AzureOpenAIService;
		const service = new JobRoleChatService(jobRolesService, aiService);

		const result = await service.answer(
			"What are the responsibilities of the Astronaut role?",
		);

		expect(result).toEqual({
			answer: "I couldn't find any matching roles.",
			roles: [],
		});
		expect(jobRolesService.findById).not.toHaveBeenCalled();
		expect(aiService.answer).not.toHaveBeenCalled();
	});

	it("uses Azure for detailed questions about a named role", async () => {
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

		await service.answer(
			"What responsibilities does the Software Engineer role have?",
		);

		expect(aiService.answer).toHaveBeenCalledOnce();
	});
});
