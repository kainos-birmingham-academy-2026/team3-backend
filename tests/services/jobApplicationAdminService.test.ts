import { beforeEach, describe, expect, it, vi } from "vitest";
import { JobApplicationAdminService } from "../../src/services/jobApplicationAdminService";
const {
  mockFindMany,
  mockFindFirst,
  mockFindUnique,
  mockUpdate,
  mockUpdateMany,
  mockTransaction,
} = vi.hoisted(() => {
  return {
    mockFindMany: vi.fn(),
    mockFindFirst: vi.fn(),
    mockFindUnique: vi.fn(),
    mockUpdate: vi.fn(),
    mockUpdateMany: vi.fn(),
    mockTransaction: vi.fn(),
  };
});

vi.mock("../../src/prismaClient.ts", () => {
  return {
    default: {
      application: {
        findMany: mockFindMany,
        findFirst: mockFindFirst,
        findUnique: mockFindUnique,
        update: mockUpdate,
      },
      jobRole: {
        updateMany: mockUpdateMany,
      },
      $transaction: mockTransaction,
    },
  };
});


describe("jobApplicationAdminService", () => {

  let service: JobApplicationAdminService;

  beforeEach(() => {
    vi.clearAllMocks();

    mockTransaction.mockImplementation(async (callback: (tx: any) => Promise<unknown>) =>
      callback({
        application: {
          findFirst: mockFindFirst,
          update: mockUpdate,
          findUnique: mockFindUnique,
        },
        jobRole: {
          updateMany: mockUpdateMany,
        },
      })
    );

    service = new JobApplicationAdminService();
  });

  it("should return an array", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        applicationId: 1,
        jobRoleId: 1,
        cvText: "cv-1.pdf",
        createdAt: new Date("2026-08-12T10:00:00.000Z"),
        applicationStatus: "IN_PROGRESS",
        jobRole: {
          roleName: "Software Engineer",
        },
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
        applicant: "candidate@example.com",
        applicantName: "candidate@example.com",
        email: "candidate@example.com",
        appliedRole: "Software Engineer",
        roleName: "Software Engineer",
        applicationDate: new Date("2026-08-12T10:00:00.000Z"),
        createdAt: new Date("2026-08-12T10:00:00.000Z"),
        username: "candidate@example.com",
        cvText: "cv-1.pdf",
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
        cvText: true,
        createdAt: true,
        applicationStatus: true,
        jobRole: {
          select: {
            roleName: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  });

  it("should omit actions for non IN_PROGRESS statuses", async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        applicationId: 2,
        jobRoleId: 1,
        cvText: "cv-2.pdf",
        createdAt: new Date("2026-08-12T10:00:00.000Z"),
        applicationStatus: "HIRED",
        jobRole: {
          roleName: "Software Engineer",
        },
        user: {
          id: 11,
          email: "hired@example.com",
        },
      },
    ]);

    const result = await service.findAll(1);

    expect(result[0]?.actions).toBeUndefined();
  });

  it("should map APPROVED status to hire flow", async () => {
    const hireSpy = vi
      .spyOn(service, "hireApplicantById")
      .mockResolvedValueOnce({ message: "Applicant hired" } as never);

    await service.updateApplicationStatusById(9, "APPROVED");

    expect(hireSpy).toHaveBeenCalledWith(9);
  });

  it("should map REJECT alias to reject flow", async () => {
    const rejectSpy = vi
      .spyOn(service, "rejectApplicantById")
      .mockResolvedValueOnce({ message: "Applicant rejected" } as never);

    await service.updateApplicationStatusById(10, "REJECT");

    expect(rejectSpy).toHaveBeenCalledWith(10);
  });

  it("should hire applicant when application is in progress and positions remain", async () => {
    mockFindFirst.mockResolvedValueOnce({
      applicationId: 7,
      jobRoleId: 3,
      applicationStatus: "IN_PROGRESS",
      jobRole: { numberOfOpenPositions: 2 },
      user: { email: "candidate@example.com" },
    });
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockUpdate.mockResolvedValueOnce({
      applicationId: 7,
      applicationStatus: "HIRED",
      user: { email: "candidate@example.com" },
    });

    const result = await service.hireApplicant(3, 7);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { applicationId: 7, jobRoleId: 3 },
      include: {
        user: { select: { email: true } },
        jobRole: { select: { numberOfOpenPositions: true } },
      },
    });
    expect(mockUpdateMany).toHaveBeenCalledWith({
      where: { jobRoleId: 3, numberOfOpenPositions: { gt: 0 } },
      data: { numberOfOpenPositions: { decrement: 1 } },
    });
    expect(result).toEqual({
      message: "Applicant hired",
      application: {
        applicationId: 7,
        username: "candidate@example.com",
        status: "HIRED",
      },
    });
  });

  it("should throw when hiring a missing application", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    await expect(service.hireApplicant(3, 404)).rejects.toThrow("Application not found");
  });

  it("should throw when hiring non IN_PROGRESS application", async () => {
    mockFindFirst.mockResolvedValueOnce({
      applicationId: 8,
      jobRoleId: 3,
      applicationStatus: "REJECTED",
      jobRole: { numberOfOpenPositions: 2 },
      user: { email: "candidate@example.com" },
    });

    await expect(service.hireApplicant(3, 8)).rejects.toThrow(
      "Only IN_PROGRESS applications can be hired"
    );
  });

  it("should throw when no open positions remain before hire", async () => {
    mockFindFirst.mockResolvedValueOnce({
      applicationId: 9,
      jobRoleId: 3,
      applicationStatus: "IN_PROGRESS",
      jobRole: { numberOfOpenPositions: 0 },
      user: { email: "candidate@example.com" },
    });

    await expect(service.hireApplicant(3, 9)).rejects.toThrow(
      "No open positions remaining for this role"
    );
  });

  it("should throw when guarded decrement updates no rows", async () => {
    mockFindFirst.mockResolvedValueOnce({
      applicationId: 10,
      jobRoleId: 3,
      applicationStatus: "IN_PROGRESS",
      jobRole: { numberOfOpenPositions: 1 },
      user: { email: "candidate@example.com" },
    });
    mockUpdateMany.mockResolvedValueOnce({ count: 0 });

    await expect(service.hireApplicant(3, 10)).rejects.toThrow(
      "No open positions remaining for this role"
    );
  });

  it("should reject applicant when status is IN_PROGRESS", async () => {
    mockFindFirst.mockResolvedValueOnce({
      applicationId: 11,
      jobRoleId: 4,
      applicationStatus: "IN_PROGRESS",
      user: { email: "candidate@example.com" },
    });
    mockUpdate.mockResolvedValueOnce({
      applicationId: 11,
      applicationStatus: "REJECTED",
      user: { email: "candidate@example.com" },
    });

    const result = await service.rejectApplicant(4, 11);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { applicationId: 11, jobRoleId: 4 },
      include: {
        user: { select: { email: true } },
      },
    });
    expect(result).toEqual({
      message: "Applicant rejected",
      application: {
        applicationId: 11,
        username: "candidate@example.com",
        status: "REJECTED",
      },
    });
  });

  it("should throw when rejecting a missing application", async () => {
    mockFindFirst.mockResolvedValueOnce(null);

    await expect(service.rejectApplicant(4, 404)).rejects.toThrow("Application not found");
  });

  it("should throw when rejecting non IN_PROGRESS application", async () => {
    mockFindFirst.mockResolvedValueOnce({
      applicationId: 12,
      jobRoleId: 4,
      applicationStatus: "HIRED",
      user: { email: "candidate@example.com" },
    });

    await expect(service.rejectApplicant(4, 12)).rejects.toThrow(
      "Only IN_PROGRESS applications can be rejected"
    );
  });
});