import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDao = {
	findAll: vi.fn(),
	findById: vi.fn(),
};

const mockMapper = {
	jobRoleToResponse: vi.fn(),
	jobRoleToDetailedResponse: vi.fn(),
};

vi.mock("../../src/models/jobRoleDao.js", () => ({
	JobRoleDao: class {
		findAll = mockDao.findAll;
		findById = mockDao.findById;
	},
}));

vi.mock("../../src/mappers/jobRoleMapper.js", () => ({
	JobRoleMapper: class {
		jobRoleToResponse = mockMapper.jobRoleToResponse;
		jobRoleToDetailedResponse = mockMapper.jobRoleToDetailedResponse;
	},
}));

import { JobRolesService } from "../../src/services/jobRolesService.js";
import { JobRole } from "../../src/models/jobRole.js";
import { NotFoundError } from "../../src/errors/notFoundError.js";

const jobRole1 = new JobRole(
	1,
	"Software Engineer",
	"Build and maintain software systems",
	"Code development, testing, deployment",
	"https://sharepoint.example.com/roles/1",
	2,
	new Date("2026-12-31"),
	"Software Engineering",
	"Engineer",
	"Birmingham",
	"123 Street",
	null,
	"B1 1AA",
	"OPEN",
	new Date("2026-01-01T10:00:00.000Z"),
	new Date("2026-01-02T10:00:00.000Z"),
);

describe("JobRolesService", () => {
	let service: JobRolesService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new JobRolesService();
	});

	describe("findAll", () => {
		it("should return an array", async () => {
			const mockResponse = {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: new Date("2026-12-31"),
				capabilityName: "Software Engineering",
				bandName: "Engineer",
				locationName: "Birmingham",
				statusName: "OPEN",
			};

			mockDao.findAll.mockResolvedValue([jobRole1]);
			mockMapper.jobRoleToResponse.mockReturnValue(mockResponse);

			const jobRoles = await service.findAll();

			expect(Array.isArray(jobRoles)).toBe(true);
			expect(mockDao.findAll).toHaveBeenCalledTimes(1);
		});

		it("should return all seeded job roles", async () => {
			const mockResponses = [
				{
					jobRoleId: 1,
					roleName: "Software Engineer",
					closingDate: new Date("2026-12-31"),
					capabilityName: "Software Engineering",
					bandName: "Engineer",
					locationName: "Birmingham",
					statusName: "OPEN",
				},
			];

			mockDao.findAll.mockResolvedValue([jobRole1]);
			mockMapper.jobRoleToResponse.mockReturnValue(mockResponses[0]);

			const jobRoles = await service.findAll();

			expect(jobRoles).toHaveLength(1);
		});
	});

	describe("findById", () => {
		it("should return the correct job role when found", async () => {
			const mockResponse = {
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
			};

			mockDao.findById.mockResolvedValue(jobRole1);
			mockMapper.jobRoleToDetailedResponse.mockReturnValue(mockResponse);

			const jobRole = await service.findById(1);

			expect(jobRole).toMatchObject({ jobRoleId: 1, roleName: "Software Engineer" });
			expect(mockDao.findById).toHaveBeenCalledWith(1);
		});

		it("should throw NotFoundError when the id does not exist", async () => {
			mockDao.findById.mockResolvedValue(null);

			await expect(service.findById(999)).rejects.toThrow(NotFoundError);
		});
	});
});
