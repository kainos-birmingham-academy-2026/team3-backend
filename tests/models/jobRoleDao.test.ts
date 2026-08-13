import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/prismaClient.js", () => ({
	default: {
		jobRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
			create: vi.fn(),
		},
		application: {
			findFirst: vi.fn(),
			create: vi.fn(),
		},
	},
}));

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

describe("JobRoleDao", () => {
	let dao: JobRoleDao;

	beforeEach(() => {
		vi.resetAllMocks();
		dao = new JobRoleDao();
	});

	describe("findAll", () => {
		it("should query database using Prisma client", async () => {
			vi.mocked(prisma.jobRole.findMany as any).mockResolvedValue([]);

			await dao.findAll();

			expect(prisma.jobRole.findMany).toHaveBeenCalledTimes(1);
			expect(prisma.jobRole.findMany).toHaveBeenCalledWith({
				relationLoadStrategy: "join",
				include: {
					status: true,
					location: true,
					capability: true,
					band: true,
				},
			});
		});

		it("should return array of JobRole objects", async () => {
			const mockJobRoles = [mockJobRoleRow()];

			vi.mocked(prisma.jobRole.findMany as any).mockResolvedValue(mockJobRoles);

			const result = await dao.findAll();

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(1);
		});

		it("should return empty array when no job roles in database", async () => {
			vi.mocked(prisma.jobRole.findMany as any).mockResolvedValue([]);

			const result = await dao.findAll();

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(0);
		});

		it("should throw error when database fails", async () => {
			const connectionError = new Error("Database connection failed");
			vi.mocked(prisma.jobRole.findMany as any).mockRejectedValue(connectionError);

			await expect(dao.findAll()).rejects.toThrow("Database connection failed");
		});
	});

	describe("findById", () => {
		it("should query database for specific job role", async () => {
			const mockJobRole = mockJobRoleRow();
			vi.mocked(prisma.jobRole.findUnique as any).mockResolvedValue(mockJobRole);

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
			vi.mocked(prisma.jobRole.findUnique as any).mockResolvedValue(mockJobRole);

			const result = await dao.findById(1);

			expect(result).toBeDefined();
			expect(result?.jobRoleId).toBe(1);
		});

		it("should return null when job role not found", async () => {
			vi.mocked(prisma.jobRole.findUnique as any).mockResolvedValue(null);

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

			vi.mocked(prisma.jobRole.create as any).mockResolvedValue(mockJobRole);

			const result = await dao.createJobRole(createData);

			expect(prisma.jobRole.create).toHaveBeenCalledWith({
				data: {
					...createData,
					statusId: 1,
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
			vi.mocked(prisma.jobRole.create as any).mockRejectedValue(new Error("Create failed"));

			await expect(dao.createJobRole({ roleName: "Role" })).rejects.toThrow("Create failed");
		});
	});

	describe("findApplicationByUserIdAndJobRoleId", () => {
		it("should return an application when one exists", async () => {
			const application = {
				applicationId: 1,
				jobRoleId: 2,
				userId: 3,
				cvText: "CV-2026-001",
			};
			vi.mocked(prisma.application.findFirst as any).mockResolvedValue(application);

			const result = await dao.findApplicationByUserIdAndJobRoleId(3, 2);

			expect(prisma.application.findFirst).toHaveBeenCalledWith({
				where: { userId: 3, jobRoleId: 2 },
			});
			expect(result).toEqual(application);
		});

		it("should return null when no application exists", async () => {
			vi.mocked(prisma.application.findFirst as any).mockResolvedValue(null);

			const result = await dao.findApplicationByUserIdAndJobRoleId(3, 999);

			expect(result).toBeNull();
		});
	});

	describe("createApplication", () => {
		it("should create and return an application domain object", async () => {
			const applicationData = {
				jobRoleId: 2,
				userId: 3,
				cvText: "CV-2026-001",
			};
			vi.mocked(prisma.application.create as any).mockResolvedValue({
				applicationId: 1,
				...applicationData,
			});

			const result = await dao.createApplication(applicationData);

			expect(prisma.application.create).toHaveBeenCalledWith({
				data: applicationData,
			});
			expect(result.applicationId).toBe(1);
			expect(result.jobRoleId).toBe(2);
			expect(result.userId).toBe(3);
			expect(result.cvText).toBe("CV-2026-001");
		});

		it("should propagate database errors", async () => {
			vi.mocked(prisma.application.create as any).mockRejectedValue(new Error("Create failed"));

			await expect(dao.createApplication({})).rejects.toThrow("Create failed");
		});
	});
});
