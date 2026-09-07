import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
			count: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
		application: {
			findFirst: vi.fn(),
			create: vi.fn(),
		},
		status: {
			findMany: vi.fn(),
			findUniqueOrThrow: vi.fn(),
		},
		band: { findMany: vi.fn() },
		capability: { findMany: vi.fn() },
		location: { findMany: vi.fn() },
	},
}));

import type { CreateJobRoleRequestDto } from "../../src/dtos/jobRoleDto.js";
import {
	ApplicationStatus,
	StatusEnum,
} from "../../src/generated/prisma/enums.js";
import { JobRoleDao } from "../../src/models/jobRoleDao.js";
import prisma from "../../src/prismaClient.js";

const mockJobRoleRow = (overrides: Record<string, unknown> = {}) => ({
	jobRoleId: 1,
	roleName: "Software Engineer",
	description: "Build and maintain software systems",
	responsibilities: "Code development, testing, deployment",
	sharepointUrl: "https://sharepoint.example.com/roles/1",
	numberOfOpenPositions: 2,
	closingDate: new Date("2026-12-31"),
	capabilityId: 1,
	bandId: 1,
	locationId: 1,
	statusId: 1,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-02"),
	location: {
		locationId: 1,
		locationName: "Belfast",
		addressLine1: "123 Street",
		addressLine2: null,
		postcode: "BT1 1AA",
		createdAt: new Date("2026-01-01"),
		updatedAt: new Date("2026-01-01"),
	},
	capability: {
		capabilityId: 1,
		capabilityName: "Software Engineering",
		createdAt: new Date("2026-01-01"),
		updatedAt: new Date("2026-01-01"),
	},
	band: {
		bandId: 1,
		bandName: "Engineer",
		createdAt: new Date("2026-01-01"),
		updatedAt: new Date("2026-01-01"),
	},
	status: {
		statusId: 1,
		statusName: "OPEN",
		createdAt: new Date("2026-01-01"),
		updatedAt: new Date("2026-01-01"),
	},
	...overrides,
});

const mockApplicationRow = (overrides: Record<string, unknown> = {}) => ({
	applicationId: 1,
	jobRoleId: 2,
	userId: 3,
	cvText: "CV-2026-001",
	applicationStatus: ApplicationStatus.IN_PROGRESS,
	createdAt: new Date("2026-01-01"),
	updatedAt: new Date("2026-01-02"),
	...overrides,
});

describe("JobRoleDao", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(
			prisma.status
				.findUniqueOrThrow as unknown as typeof prisma.status.findUniqueOrThrow,
		).mockResolvedValue({
			statusId: 2,
			statusName: StatusEnum.OPEN,
			createdAt: new Date("2026-01-01"),
			updatedAt: new Date("2026-01-02"),
		});
		dao = new JobRoleDao();
	});

	describe("findAll", () => {
		it("should query database using Prisma client", async () => {
			vi.mocked(
				prisma.jobRole.findMany as unknown as typeof prisma.jobRole.findMany,
			).mockResolvedValue([]);
			vi.mocked(prisma.jobRole.count).mockResolvedValue(0);

			await dao.findAll();

			expect(prisma.jobRole.findMany).toHaveBeenCalledTimes(1);
			expect(prisma.jobRole.findMany).toHaveBeenCalledWith({
				where: {
					roleName: undefined,
					locationId: undefined,
					capabilityId: undefined,
					bandId: undefined,
					closingDate: undefined,
				},
				orderBy: { jobRoleId: "asc" },
				skip: 0,
				take: 10,
				relationLoadStrategy: "join",
				include: {
					status: true,
					location: true,
					capability: true,
					band: true,
				},
			});
		});

		it("should translate filters into Prisma conditions", async () => {
			vi.mocked(
				prisma.jobRole.findMany as unknown as typeof prisma.jobRole.findMany,
			).mockResolvedValue([]);
			vi.mocked(prisma.jobRole.count).mockResolvedValue(0);

			await dao.findAll({
				roleName: "engineer",
				locationId: [1, 2],
				capabilityId: [3],
				bandId: [4],
				closingDateFrom: "2026-09-01",
				closingDateTo: "2026-12-31",
				page: 2,
				pageSize: 5,
			});

			expect(prisma.jobRole.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: {
						roleName: { contains: "engineer", mode: "insensitive" },
						locationId: { in: [1, 2] },
						capabilityId: { in: [3] },
						bandId: { in: [4] },
						closingDate: {
							gte: new Date("2026-09-01T00:00:00.000Z"),
							lt: new Date("2027-01-01T00:00:00.000Z"),
						},
					},
					skip: 5,
					take: 5,
				}),
			);
			expect(prisma.jobRole.count).toHaveBeenCalledWith({
				where: {
					roleName: { contains: "engineer", mode: "insensitive" },
					locationId: { in: [1, 2] },
					capabilityId: { in: [3] },
					bandId: { in: [4] },
					closingDate: {
						gte: new Date("2026-09-01T00:00:00.000Z"),
						lt: new Date("2027-01-01T00:00:00.000Z"),
					},
				},
			});
		});

		it("should return array of JobRole objects", async () => {
			const mockJobRoles = [mockJobRoleRow()];

			vi.mocked(
				prisma.jobRole.findMany as unknown as typeof prisma.jobRole.findMany,
			).mockResolvedValue(mockJobRoles);
			vi.mocked(prisma.jobRole.count).mockResolvedValue(1);

			const result = await dao.findAll();

			expect(result.items).toHaveLength(1);
			expect(result.totalItems).toBe(1);
		});

		it("should return empty array when no job roles in database", async () => {
			vi.mocked(
				prisma.jobRole.findMany as unknown as typeof prisma.jobRole.findMany,
			).mockResolvedValue([]);
			vi.mocked(prisma.jobRole.count).mockResolvedValue(0);

			const result = await dao.findAll();

			expect(result).toEqual({ items: [], totalItems: 0 });
		});

		it("should throw error when database fails", async () => {
			const connectionError = new Error("Database connection failed");
			vi.mocked(
				prisma.jobRole.findMany as unknown as typeof prisma.jobRole.findMany,
			).mockRejectedValue(connectionError);

			await expect(dao.findAll()).rejects.toThrow("Database connection failed");
		});
	});

	describe("findById", () => {
		it("should query database for specific job role", async () => {
			const mockJobRole = mockJobRoleRow();
			vi.mocked(
				prisma.jobRole
					.findUnique as unknown as typeof prisma.jobRole.findUnique,
			).mockResolvedValue(mockJobRole);

			await dao.findById(1);

			expect(prisma.jobRole.findUnique).toHaveBeenCalledTimes(1);
			expect(prisma.jobRole.findUnique).toHaveBeenCalledWith({
				where: { jobRoleId: 1 },
				relationLoadStrategy: "join",
				include: {
					status: true,
					location: true,
					capability: true,
					band: true,
				},
			});
		});

		it("should return JobRole when found", async () => {
			const mockJobRole = mockJobRoleRow();
			vi.mocked(
				prisma.jobRole
					.findUnique as unknown as typeof prisma.jobRole.findUnique,
			).mockResolvedValue(mockJobRole);

			const result = await dao.findById(1);

			expect(result).toBeDefined();
			expect(result?.jobRoleId).toBe(1);
		});

		it("should return null when job role not found", async () => {
			vi.mocked(
				prisma.jobRole
					.findUnique as unknown as typeof prisma.jobRole.findUnique,
			).mockResolvedValue(null);

			const result = await dao.findById(999);

			expect(result).toBeNull();
		});
	});

	describe("createJobRole", () => {
		it("should create a job role with OPEN status and return a domain object", async () => {
			const mockJobRole = mockJobRoleRow();
			const createData = {
				roleName: "Software Engineer",
				description: "Build and maintain software systems",
				responsibilities: "Code development, testing, deployment",
				sharepointUrl: "https://sharepoint.example.com/roles/1",
				numberOfOpenPositions: 2,
				closingDate: new Date("2026-12-31"),
				capabilityId: 1,
				bandId: 1,
				locationId: 1,
			};

			vi.mocked(
				prisma.jobRole.create as unknown as typeof prisma.jobRole.create,
			).mockResolvedValue(mockJobRole);

			const result = await dao.createJobRole(createData);

			expect(prisma.status.findUniqueOrThrow).toHaveBeenCalledWith({
				where: { statusName: "OPEN" },
				select: { statusId: true },
			});
			expect(prisma.jobRole.create).toHaveBeenCalledWith({
				data: {
					...createData,
					statusId: 2,
				},
				relationLoadStrategy: "join",
				include: {
					status: true,
					location: true,
					capability: true,
					band: true,
				},
			});
			expect(result.jobRoleId).toBe(1);
			expect(result.statusName).toBe("OPEN");
		});

		it("should propagate database errors", async () => {
			vi.mocked(
				prisma.jobRole.create as unknown as typeof prisma.jobRole.create,
			).mockRejectedValue(new Error("Create failed"));
			const createData: CreateJobRoleRequestDto = {
				roleName: "Role",
				description: "Role description",
				responsibilities: "Role responsibilities",
				sharepointUrl: "https://example.com/role",
				numberOfOpenPositions: 1,
				capabilityId: 1,
				bandId: 1,
				locationId: 1,
			};

			await expect(dao.createJobRole(createData)).rejects.toThrow(
				"Create failed",
			);
		});
	});

	describe("updateJobRole", () => {
		it("should update editable fields and return a domain object", async () => {
			const updateData = {
				roleName: "Lead Software Engineer",
				description: "Lead delivery",
				responsibilities: "Coach engineers",
				sharepointUrl: "https://example.com/lead-role",
				numberOfOpenPositions: 3,
				closingDate: new Date("2099-12-31"),
				capabilityId: 2,
				bandId: 3,
				locationId: 4,
			};
			vi.mocked(
				prisma.jobRole.update as unknown as typeof prisma.jobRole.update,
			).mockResolvedValue(mockJobRoleRow({ roleName: updateData.roleName }));

			const result = await dao.updateJobRole(1, updateData);

			expect(prisma.jobRole.update).toHaveBeenCalledWith({
				where: { jobRoleId: 1 },
				data: updateData,
				relationLoadStrategy: "join",
				include: {
					status: true,
					location: true,
					capability: true,
					band: true,
				},
			});
			expect(result.roleName).toBe("Lead Software Engineer");
		});
	});

	describe("deleteJobRole", () => {
		it("should delete a job role by ID", async () => {
			vi.mocked(
				prisma.jobRole.delete as unknown as typeof prisma.jobRole.delete,
			).mockResolvedValue(mockJobRoleRow());

			await dao.deleteJobRole(1);

			expect(prisma.jobRole.delete).toHaveBeenCalledWith({
				where: { jobRoleId: 1 },
			});
		});
	});

	describe("findApplicationByUserIdAndJobRoleId", () => {
		it("should return an application when one exists", async () => {
			const application = mockApplicationRow();
			vi.mocked(
				prisma.application
					.findFirst as unknown as typeof prisma.application.findFirst,
			).mockResolvedValue(application);

			const result = await dao.findApplicationByUserIdAndJobRoleId(3, 2);

			expect(prisma.application.findFirst).toHaveBeenCalledWith({
				where: { userId: 3, jobRoleId: 2 },
			});
			expect(result).toEqual({
				applicationId: 1,
				jobRoleId: 2,
				userId: 3,
				cvText: "CV-2026-001",
			});
		});

		it("should return null when no application exists", async () => {
			vi.mocked(
				prisma.application
					.findFirst as unknown as typeof prisma.application.findFirst,
			).mockResolvedValue(null);

			const result = await dao.findApplicationByUserIdAndJobRoleId(3, 999);

			expect(result).toBeNull();
		});
	});

	describe("createApplication", () => {
		it("should create and return an application domain object", async () => {
			const jobRoleId = 2;
			const userId = 3;
			const applicationData = { cvText: "CV-2026-001" };
			vi.mocked(
				prisma.application
					.create as unknown as typeof prisma.application.create,
			).mockResolvedValue(
				mockApplicationRow({ jobRoleId, userId, ...applicationData }),
			);

			const result = await dao.createApplication(
				jobRoleId,
				userId,
				applicationData,
			);

			expect(prisma.application.create).toHaveBeenCalledWith({
				data: { jobRoleId, userId, ...applicationData },
			});
			expect(result.applicationId).toBe(1);
			expect(result.jobRoleId).toBe(2);
			expect(result.userId).toBe(3);
			expect(result.cvText).toBe("CV-2026-001");
		});

		it("should propagate database errors", async () => {
			vi.mocked(
				prisma.application
					.create as unknown as typeof prisma.application.create,
			).mockRejectedValue(new Error("Create failed"));

			await expect(
				dao.createApplication(2, 3, { cvText: "CV-2026-001" }),
			).rejects.toThrow("Create failed");
		});
	});

	describe("lookup methods", () => {
		it("should return status lookup values", async () => {
			vi.mocked(
				prisma.status.findMany as unknown as typeof prisma.status.findMany,
			).mockResolvedValue([
				{
					statusId: 1,
					statusName: "OPEN",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const result = await dao.getStatus();

			expect(prisma.status.findMany).toHaveBeenCalledWith();
			expect(result).toEqual([{ statusId: 1, statusName: "OPEN" }]);
		});

		it("should return band lookup values", async () => {
			vi.mocked(
				prisma.band.findMany as unknown as typeof prisma.band.findMany,
			).mockResolvedValue([
				{
					bandId: 2,
					bandName: "Engineer",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const result = await dao.getBands();

			expect(prisma.band.findMany).toHaveBeenCalledWith();
			expect(result).toEqual([{ bandId: 2, bandName: "Engineer" }]);
		});

		it("should return capability lookup values", async () => {
			vi.mocked(
				prisma.capability
					.findMany as unknown as typeof prisma.capability.findMany,
			).mockResolvedValue([
				{
					capabilityId: 3,
					capabilityName: "Software",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const result = await dao.getCapabilities();

			expect(prisma.capability.findMany).toHaveBeenCalledWith();
			expect(result).toEqual([{ capabilityId: 3, capabilityName: "Software" }]);
		});

		it("should return location lookup values", async () => {
			vi.mocked(
				prisma.location.findMany as unknown as typeof prisma.location.findMany,
			).mockResolvedValue([
				{
					locationId: 4,
					locationName: "Birmingham",
					addressLine1: "123 Street",
					addressLine2: null,
					postcode: "B1 1AA",
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			]);

			const result = await dao.getLocations();

			expect(prisma.location.findMany).toHaveBeenCalledWith();
			expect(result).toEqual([
				{
					locationId: 4,
					locationName: "Birmingham",
					addressLine1: "123 Street",
					addressLine2: null,
					postcode: "B1 1AA",
				},
			]);
		});
	});
});
