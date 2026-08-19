import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDao = {
	findAll: vi.fn(),
	findById: vi.fn(),
	updateJobRole: vi.fn(),
	deleteJobRole: vi.fn(),
	createApplication: vi.fn(),
	findApplicationByUserIdAndJobRoleId: vi.fn(),
	getStatus: vi.fn(),
	getBands: vi.fn(),
	getCapabilities: vi.fn(),
	getLocations: vi.fn(),
};

const mockMapper = {
	jobRoleToResponse: vi.fn(),
	jobRoleToDetailedResponse: vi.fn(),
	statusToResponse: vi.fn(),
	bandToResponse: vi.fn(),
	capabilityToResponse: vi.fn(),
	locationToResponse: vi.fn(),
};

vi.mock("../../src/models/jobRoleDao.js", () => ({
	JobRoleDao: class {
		findAll = mockDao.findAll;
		findById = mockDao.findById;
		updateJobRole = mockDao.updateJobRole;
		deleteJobRole = mockDao.deleteJobRole;
		createApplication = mockDao.createApplication;
		findApplicationByUserIdAndJobRoleId =
			mockDao.findApplicationByUserIdAndJobRoleId;
		getStatus = mockDao.getStatus;
		getBands = mockDao.getBands;
		getCapabilities = mockDao.getCapabilities;
		getLocations = mockDao.getLocations;
	},
}));

vi.mock("../../src/mappers/jobRoleMapper.js", () => ({
	JobRoleMapper: class {
		jobRoleToResponse = mockMapper.jobRoleToResponse;
		jobRoleToDetailedResponse = mockMapper.jobRoleToDetailedResponse;
		statusToResponse = mockMapper.statusToResponse;
		bandToResponse = mockMapper.bandToResponse;
		capabilityToResponse = mockMapper.capabilityToResponse;
		locationToResponse = mockMapper.locationToResponse;
	},
}));

import { NotFoundError } from "error-lib";
import { ConflictError } from "../../src/errors/conflictError.js";
import { JobRole } from "../../src/models/jobRole.js";
import { JobRolesService } from "../../src/services/jobRolesService.js";

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

			expect(jobRole).toMatchObject({
				jobRoleId: 1,
				roleName: "Software Engineer",
			});
			expect(mockDao.findById).toHaveBeenCalledWith(1);
		});

		it("should throw NotFoundError when the id does not exist", async () => {
			mockDao.findById.mockResolvedValue(null);

			await expect(service.findById(999)).rejects.toThrow(NotFoundError);
		});
	});

	describe("deleteJobRole", () => {
		it("should delete an existing job role", async () => {
			mockDao.findById.mockResolvedValue(jobRole1);
			mockDao.deleteJobRole.mockResolvedValue(undefined);

			await service.deleteJobRole(1);

			expect(mockDao.findById).toHaveBeenCalledWith(1);
			expect(mockDao.deleteJobRole).toHaveBeenCalledWith(1);
		});

		it("should throw NotFoundError without deleting a missing role", async () => {
			mockDao.findById.mockResolvedValue(null);

			await expect(service.deleteJobRole(999)).rejects.toThrow(
				"JobRole with id 999 not found",
			);
			expect(mockDao.deleteJobRole).not.toHaveBeenCalled();
		});
	});

	describe("updateJobRole", () => {
		const updateData = {
			roleName: "Lead Software Engineer",
			description: "Lead delivery",
			responsibilities: "Coach engineers",
			sharepointUrl: "https://example.com/lead-role",
			numberOfOpenPositions: 3,
			closingDate: undefined,
			capabilityId: 1,
			bandId: 1,
			locationId: 1,
		};

		it("should update and map an existing job role", async () => {
			const mappedResponse = { jobRoleId: 1, roleName: updateData.roleName };
			mockDao.findById.mockResolvedValue(jobRole1);
			mockDao.updateJobRole.mockResolvedValue(jobRole1);
			mockMapper.jobRoleToDetailedResponse.mockReturnValue(mappedResponse);

			const result = await service.updateJobRole(1, updateData);

			expect(mockDao.updateJobRole).toHaveBeenCalledWith(1, updateData);
			expect(result).toBe(mappedResponse);
		});

		it("should throw NotFoundError without updating a missing role", async () => {
			mockDao.findById.mockResolvedValue(null);

			await expect(service.updateJobRole(999, updateData)).rejects.toThrow(
				NotFoundError,
			);
			expect(mockDao.updateJobRole).not.toHaveBeenCalled();
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

			const result = await service.createApplication(
				jobRoleId,
				userId,
				applicationData,
			);

			expect(result).toSatisfy(
				(value) =>
					value.applicationId === 1 &&
					value.jobRoleId === 1 &&
					value.userId === 1 &&
					value.cvText === "CV-2026-001",
			);
			expect(mockDao.findById).toHaveBeenCalledWith(1);
			expect(mockDao.findApplicationByUserIdAndJobRoleId).toHaveBeenCalledWith(
				1,
				1,
			);
			expect(mockDao.createApplication).toHaveBeenCalledWith(
				jobRoleId,
				userId,
				applicationData,
			);
		});

		it("should throw NotFoundError when job role does not exist", async () => {
			const jobRoleId = 999;
			const userId = 1;
			const applicationData = {
				cvText: "CV-2026-001",
			};

			mockDao.findById.mockResolvedValue(null);

			await expect(
				service.createApplication(jobRoleId, userId, applicationData),
			).rejects.toThrow(NotFoundError);
			await expect(
				service.createApplication(jobRoleId, userId, applicationData),
			).rejects.toThrow("JobRole with id 999 not found");

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
			mockDao.findApplicationByUserIdAndJobRoleId.mockResolvedValue(
				existingApplication,
			);

			await expect(
				service.createApplication(jobRoleId, userId, applicationData),
			).rejects.toThrow(ConflictError);
			await expect(
				service.createApplication(jobRoleId, userId, applicationData),
			).rejects.toThrow(
				"User with id 1 has already applied for JobRole with id 1",
			);

			expect(mockDao.createApplication).not.toHaveBeenCalled();
		});
	});

	describe("lookup methods", () => {
		it("should return mapped statuses", async () => {
			const statuses = [{ statusId: 1, statusName: "OPEN" }];
			mockDao.getStatus.mockResolvedValue(statuses);
			mockMapper.statusToResponse.mockReturnValue(statuses);

			const result = await service.getStatus();

			expect(result).toEqual(statuses);
			expect(mockDao.getStatus).toHaveBeenCalledTimes(1);
		});

		it("should throw NotFoundError when no statuses exist", async () => {
			mockDao.getStatus.mockResolvedValue([]);

			await expect(service.getStatus()).rejects.toThrow("No status found");
		});

		it("should return mapped bands", async () => {
			const bands = [{ bandId: 2, bandName: "Engineer" }];
			mockDao.getBands.mockResolvedValue(bands);
			mockMapper.bandToResponse.mockReturnValue(bands);

			expect(await service.getBands()).toEqual(bands);
		});

		it("should throw NotFoundError when no bands exist", async () => {
			mockDao.getBands.mockResolvedValue([]);

			await expect(service.getBands()).rejects.toThrow("No bands found");
		});

		it("should return mapped capabilities", async () => {
			const capabilities = [{ capabilityId: 3, capabilityName: "Software" }];
			mockDao.getCapabilities.mockResolvedValue(capabilities);
			mockMapper.capabilityToResponse.mockReturnValue(capabilities);

			expect(await service.getCapabilities()).toEqual(capabilities);
		});

		it("should throw NotFoundError when no capabilities exist", async () => {
			mockDao.getCapabilities.mockResolvedValue([]);

			await expect(service.getCapabilities()).rejects.toThrow(
				"No capabilities found",
			);
		});

		it("should return mapped locations", async () => {
			const locations = [{ locationId: 4, locationName: "Birmingham" }];
			mockDao.getLocations.mockResolvedValue(locations);
			mockMapper.locationToResponse.mockReturnValue(locations);

			expect(await service.getLocations()).toEqual(locations);
		});

		it("should throw NotFoundError when no locations exist", async () => {
			mockDao.getLocations.mockResolvedValue([]);

			await expect(service.getLocations()).rejects.toThrow(
				"No locations found",
			);
		});
	});
});
