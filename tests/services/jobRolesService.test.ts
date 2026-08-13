import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDao = {
	findAll: vi.fn(),
	findById: vi.fn(),
	createApplication: vi.fn(),
	findApplicationByUserIdAndJobRoleId: vi.fn(),
};

const mockMapper = {
	jobRoleToResponse: vi.fn(),
	jobRoleToDetailedResponse: vi.fn(),
};

vi.mock("../../src/models/jobRoleDao.js", () => ({
	JobRoleDao: class {
		findAll = mockDao.findAll;
		findById = mockDao.findById;
		createApplication = mockDao.createApplication;
		findApplicationByUserIdAndJobRoleId = mockDao.findApplicationByUserIdAndJobRoleId;
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
import { NotFoundError } from "error-lib";
import { ConflictError } from "../../src/errors/conflictError.js";

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

	describe("createApplication", () => {
		it("should return application data when application is created successfully", async () => {
			const jobRoleId = 1;
			const userId = 1;
			const applicationData = {
				cvText: "CV-2026-001",
			};

			mockDao.findById.mockResolvedValue(jobRole1);
			mockDao.findApplicationByUserIdAndJobRoleId.mockResolvedValue(null);
			mockDao.createApplication.mockResolvedValue({
				applicationId: 1,
				jobRoleId: 1,
				userId: 1,
				cvText: "CV-2026-001",
			});

			const result = await service.createApplication(jobRoleId, userId, applicationData);

			expect(result).toSatisfy(
				(value) =>
					value.applicationId === 1 &&
					value.jobRoleId === 1 &&
					value.userId === 1 &&
					value.cvText === "CV-2026-001",
			);
			expect(mockDao.findById).toHaveBeenCalledWith(1);
			expect(mockDao.findApplicationByUserIdAndJobRoleId).toHaveBeenCalledWith(1, 1);
			expect(mockDao.createApplication).toHaveBeenCalledWith(jobRoleId, userId, applicationData);
		});

		it("should throw NotFoundError when job role does not exist", async () => {
			const jobRoleId = 999;
			const userId = 1;
			const applicationData = {
				cvText: "CV-2026-001",
			};

			mockDao.findById.mockResolvedValue(null);

			await expect(service.createApplication(jobRoleId, userId, applicationData)).rejects.toThrow(NotFoundError);
			await expect(service.createApplication(jobRoleId, userId, applicationData)).rejects.toThrow(
				"JobRole with id 999 not found",
			);

			expect(mockDao.createApplication).not.toHaveBeenCalled();
		});

		it("should throw ConflictError when user has already applied", async () => {
			const jobRoleId = 1;
			const userId = 1;
			const applicationData = {
				cvText: "CV-2026-001",
			};

			const existingApplication = {
				applicationId: 1,
				jobRoleId: 1,
				userId: 1,
				cvText: "CV-2026-001",
			};

			mockDao.findById.mockResolvedValue(jobRole1);
			mockDao.findApplicationByUserIdAndJobRoleId.mockResolvedValue(existingApplication);

			await expect(service.createApplication(jobRoleId, userId, applicationData)).rejects.toThrow(ConflictError);
			await expect(service.createApplication(jobRoleId, userId, applicationData)).rejects.toThrow(
				"User with id 1 has already applied for JobRole with id 1",
			);

			expect(mockDao.createApplication).not.toHaveBeenCalled();
		});
	});
});
