import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDao = {
	findAll: vi.fn(),
	findById: vi.fn(),
	updateJobRole: vi.fn(),
	updateJobRoleStatus: vi.fn(),
	createApplication: vi.fn(),
	findApplicationByUserIdAndJobRoleId: vi.fn(),
	findJobRoleIdsByUserId: vi.fn(),
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
		updateJobRoleStatus = mockDao.updateJobRoleStatus;
		createApplication = mockDao.createApplication;
		findApplicationByUserIdAndJobRoleId =
			mockDao.findApplicationByUserIdAndJobRoleId;
		findJobRoleIdsByUserId = mockDao.findJobRoleIdsByUserId;
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
import { UpdateJobRoleSchema } from "../../src/dtos/jobRoleDto.js";
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
		it("should pass filters to the data access layer", async () => {
			const filters = {
				roleName: "engineer",
				locationId: [1, 2],
				capabilityId: [3],
				bandId: [4],
				closingDateFrom: "2026-09-01",
				closingDateTo: "2026-12-31",
				page: 2,
				pageSize: 5,
			};
			mockDao.findAll.mockResolvedValue({ items: [], totalItems: 0 });

			await service.findAll(filters);

			expect(mockDao.findAll).toHaveBeenCalledWith(filters, false);
		});

		it("should include scheduled roles for admins", async () => {
			const filters = { page: 1, pageSize: 10 };
			mockDao.findAll.mockResolvedValue({ items: [], totalItems: 0 });

			await service.findAll(filters, true);

			expect(mockDao.findAll).toHaveBeenCalledWith(filters, true);
		});

		it("should return mapped items with pagination metadata", async () => {
			const mockResponse = {
				jobRoleId: 1,
				roleName: "Software Engineer",
				closingDate: new Date("2026-12-31"),
				capabilityName: "Software Engineering",
				bandName: "Engineer",
				locationName: "Birmingham",
				statusName: "OPEN",
			};

			mockDao.findAll.mockResolvedValue({
				items: [jobRole1],
				totalItems: 11,
			});
			mockMapper.jobRoleToResponse.mockReturnValue(mockResponse);

			const jobRoles = await service.findAll({ page: 2, pageSize: 10 });

			expect(jobRoles).toEqual({
				items: [mockResponse],
				page: 2,
				pageSize: 10,
				totalItems: 11,
				totalPages: 2,
			});
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

			mockDao.findAll.mockResolvedValue({
				items: [jobRole1],
				totalItems: 1,
			});
			mockMapper.jobRoleToResponse.mockReturnValue(mockResponses[0]);

			const jobRoles = await service.findAll();

			expect(jobRoles.items).toHaveLength(1);
			expect(jobRoles).toMatchObject({
				page: 1,
				pageSize: 10,
				totalItems: 1,
				totalPages: 1,
			});
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
			expect(mockDao.findById).toHaveBeenCalledWith(1, false);
		});

		it("should throw NotFoundError when the id does not exist", async () => {
			mockDao.findById.mockResolvedValue(null);

			await expect(service.findById(999)).rejects.toThrow(NotFoundError);
		});
	});

	describe("updateJobRoleStatus", () => {
		it("should update and map an existing job role status", async () => {
			mockDao.findById.mockResolvedValue(jobRole1);
			mockDao.updateJobRoleStatus.mockResolvedValue(jobRole1);
			mockMapper.jobRoleToDetailedResponse.mockReturnValue({
				statusName: "CLOSED",
			});

			await service.updateJobRoleStatus(1, "CLOSED");

			expect(mockDao.findById).toHaveBeenCalledWith(1, true);
			expect(mockDao.updateJobRoleStatus).toHaveBeenCalledWith(1, "CLOSED");
		});

		it("should throw NotFoundError without updating a missing role", async () => {
			mockDao.findById.mockResolvedValue(null);

			await expect(service.updateJobRoleStatus(999, "OPEN")).rejects.toThrow(
				"JobRole with id 999 not found",
			);
			expect(mockDao.updateJobRoleStatus).not.toHaveBeenCalled();
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

			expect(mockDao.findById).toHaveBeenCalledWith(1, true);
			expect(mockDao.updateJobRole).toHaveBeenCalledWith(1, updateData);
			expect(result).toBe(mappedResponse);
		});

		it("should update the opening date while the role is scheduled", async () => {
			const scheduledJobRole = {
				...jobRole1,
				openingDate: new Date("2099-01-01T00:00:00.000Z"),
				closingDate: new Date("2099-12-31T00:00:00.000Z"),
			};
			const scheduledUpdate = {
				...updateData,
				openingDate: new Date("2099-02-01T00:00:00.000Z"),
			};
			mockDao.findById.mockResolvedValue(scheduledJobRole);
			mockDao.updateJobRole.mockResolvedValue(scheduledJobRole);

			await service.updateJobRole(1, scheduledUpdate);

			expect(mockDao.updateJobRole).toHaveBeenCalledWith(1, scheduledUpdate);
		});

		it.each([
			["opening date", { closingDate: "2098-12-31" }],
			["closing date", { openingDate: "2100-01-01" }],
		])(
			"should reject reversed dates when the %s is omitted",
			async (_name, dates) => {
				mockDao.findById.mockResolvedValue({
					...jobRole1,
					openingDate: new Date("2099-01-01"),
					closingDate: new Date("2099-12-31"),
				});
				const data = UpdateJobRoleSchema.parse({ ...updateData, ...dates });

				await expect(service.updateJobRole(1, data)).rejects.toMatchObject({
					statusCode: 409,
					message: "Opening date cannot be after closing date",
				});
				expect(mockDao.updateJobRole).not.toHaveBeenCalled();
			},
		);

		it.each([
			["only closing date changes", { closingDate: "2099-06-01" }],
			["only opening date changes", { openingDate: "2099-06-01" }],
			[
				"closing date equals stored opening date",
				{ closingDate: "2099-01-01" },
			],
			[
				"opening date equals stored closing date",
				{ openingDate: "2099-12-31" },
			],
			["neither date changes", {}],
		])("should preserve valid date ordering when %s", async (_name, dates) => {
			const role = {
				...jobRole1,
				openingDate: new Date("2099-01-01"),
				closingDate: new Date("2099-12-31"),
			};
			mockDao.findById.mockResolvedValue(role);
			mockDao.updateJobRole.mockResolvedValue(role);
			const data = UpdateJobRoleSchema.parse({ ...updateData, ...dates });

			await service.updateJobRole(1, data);

			expect(mockDao.updateJobRole).toHaveBeenCalledWith(1, data);
		});

		it("should allow updating an opening date without a stored closing date", async () => {
			const role = {
				...jobRole1,
				openingDate: new Date("2099-01-01"),
				closingDate: null,
			};
			mockDao.findById.mockResolvedValue(role);
			mockDao.updateJobRole.mockResolvedValue(role);
			const data = UpdateJobRoleSchema.parse({
				...updateData,
				openingDate: "2099-06-01",
			});

			await service.updateJobRole(1, data);

			expect(mockDao.updateJobRole).toHaveBeenCalledWith(1, data);
		});

		it("should reject changing the opening date after the role has opened", async () => {
			mockDao.findById.mockResolvedValue(jobRole1);

			await expect(
				service.updateJobRole(1, {
					...updateData,
					openingDate: new Date("2099-02-01T00:00:00.000Z"),
				}),
			).rejects.toThrow(
				"Opening date cannot be changed after the role has opened",
			);
			expect(mockDao.updateJobRole).not.toHaveBeenCalled();
		});

		it.each([
			["2026-09-13T22:59:59.999Z", "2026-09-14", true],
			["2026-09-13T23:00:00.000Z", "2026-09-14", false],
			["2026-03-29T23:00:00.000Z", "2026-03-30", false],
			["2026-10-24T23:00:00.000Z", "2026-10-25", false],
			["2026-10-25T23:30:00.000Z", "2026-10-26", true],
			["2026-10-26T00:00:00.000Z", "2026-10-26", false],
		])(
			"should lock opening-date edits at UK midnight at %s",
			async (now, openingDate, editable) => {
				vi.useFakeTimers();
				try {
					vi.setSystemTime(new Date(now));
					const role = {
						...jobRole1,
						openingDate: new Date(openingDate),
						closingDate: new Date("2099-12-31"),
					};
					mockDao.findById.mockResolvedValue(role);
					mockDao.updateJobRole.mockResolvedValue(role);
					const data = { ...updateData, openingDate: new Date("2099-02-01") };
					const result = service.updateJobRole(1, data);
					if (editable) {
						await result;
						expect(mockDao.updateJobRole).toHaveBeenCalledWith(1, data);
					} else {
						await expect(result).rejects.toThrow(
							"Opening date cannot be changed after the role has opened",
						);
						expect(mockDao.updateJobRole).not.toHaveBeenCalled();
					}
				} finally {
					vi.useRealTimers();
				}
			},
		);

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
			expect(mockDao.findById).toHaveBeenCalledWith(1, false);
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

		it("should throw NotFoundError when job role is missing or not yet open", async () => {
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

	describe("getAppliedJobRoleIds", () => {
		it("should return the job role ids for the given user", async () => {
			mockDao.findJobRoleIdsByUserId.mockResolvedValue([1, 2]);

			const result = await service.getAppliedJobRoleIds(42);

			expect(mockDao.findJobRoleIdsByUserId).toHaveBeenCalledWith(42);
			expect(result).toEqual([1, 2]);
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
			const bands = [{ bandId: 2, bandName: "Engineer", bandLevel: 5 }];
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
