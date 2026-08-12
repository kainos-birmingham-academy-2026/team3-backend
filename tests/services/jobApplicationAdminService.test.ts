import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobApplicationAdminService } from "../../src/services/jobApplicationAdminService";
const { mockFindMany } = vi.hoisted(() => {
  return {
    mockFindMany: vi.fn(),
  };
});

vi.mock("../../src/prismaClient.ts", () => {
  return {
    default: {
      application: {
        findMany: mockFindMany,
      },
    },
  };
});


describe("jobApplicationAdminService", () => {

  let service: JobApplicationAdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new JobApplicationAdminService();
  });

  it("should return an array", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        applicationId: 1,
        jobRoleId: 1,
        cvReference: "cv-1.pdf",
        applicationStatus: "IN_PROGRESS",
        user: {
          id: 10,
          email: "candidate@example.com",
        },
      },
    ]);

    const result = await service.findAll(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([
      {
        applicationId: 1,
        jobRoleId: 1,
        username: "candidate@example.com",
        cvUrl: "cv-1.pdf",
        status: "IN_PROGRESS",
        actions: {
          canHire: true,
          canReject: true,
        },
      },
    ]);
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { jobRoleId: 1 },
      orderBy: { createdAt: "desc" },
      select: {
        applicationId: true,
        jobRoleId: true,
        cvReference: true,
        applicationStatus: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  });

  it("should disable actions for non IN_PROGRESS statuses", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        applicationId: 2,
        jobRoleId: 1,
        cvReference: "cv-2.pdf",
        applicationStatus: "HIRED",
        user: {
          id: 11,
          email: "hired@example.com",
        },
      },
    ]);

    const result = await service.findAll(1);

    expect(result[0]?.actions).toEqual({
      canHire: false,
      canReject: false,
    });
  });
});