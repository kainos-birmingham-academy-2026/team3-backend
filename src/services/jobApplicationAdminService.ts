import prisma from "../prismaClient";

export class JobApplicationAdminService {
  async findAllAdmin() {
    const applications = await prisma.application.findMany({
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

    return applications.map((application) => ({
      applicationId: application.applicationId,
      jobRoleId: application.jobRoleId,
      applicant: application.user.email,
      applicantName: application.user.email,
      email: application.user.email,
      appliedRole: application.jobRole.roleName,
      roleName: application.jobRole.roleName,
      applicationDate: application.createdAt,
      createdAt: application.createdAt,
      username: application.user.email,
      cvText: application.cvText,
      cvUrl: application.cvText,
      status: application.applicationStatus,
      actions:
        application.applicationStatus === "IN_PROGRESS"
          ? { canHire: true, canReject: true }
          : { canHire: false, canReject: false },
    }));
  }

  async findAll(jobRoleId: number) {
    const applications = await prisma.application.findMany({
      where: { jobRoleId },
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

    return applications.map((application) => ({
      applicationId: application.applicationId,
      jobRoleId: application.jobRoleId,
      applicant: application.user.email,
      applicantName: application.user.email,
      email: application.user.email,
      appliedRole: application.jobRole.roleName,
      roleName: application.jobRole.roleName,
      applicationDate: application.createdAt,
      createdAt: application.createdAt,
      username: application.user.email,
      cvText: application.cvText,
      cvUrl: application.cvText,
      status: application.applicationStatus,
      actions:
        application.applicationStatus === "IN_PROGRESS"
          ? { canHire: true, canReject: true }
          : { canHire: false, canReject: false },
    }));
  }

  async hireApplicant(jobRoleId: number, applicationId: number) {
    return prisma.$transaction(async (tx) => {
      const application = await tx.application.findFirst({
        where: { applicationId, jobRoleId },
        include: {
          user: {
            select: {
              email: true,
            },
          },
          jobRole: {
            select: {
              numberOfOpenPositions: true,
            },
          },
        },
      });

      if (!application) {
        throw new Error("Application not found");
      }

      if (application.applicationStatus !== "IN_PROGRESS") {
        throw new Error("Only IN_PROGRESS applications can be hired");
      }

      if (application.jobRole.numberOfOpenPositions <= 0) {
        throw new Error("No open positions remaining for this role");
      }

      await tx.jobRole.update({
        where: { jobRoleId },
        data: { numberOfOpenPositions: { decrement: 1 } },
      });

      const updatedApplication = await tx.application.update({
        where: { applicationId },
        data: { applicationStatus: "HIRED" },
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      });

      return {
        message: "Applicant hired",
        application: {
          applicationId: updatedApplication.applicationId,
          username: updatedApplication.user.email,
          status: updatedApplication.applicationStatus,
        },
      };
    });
  }

  async hireApplicantById(applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { applicationId },
      select: { jobRoleId: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    return this.hireApplicant(application.jobRoleId, applicationId);
  }

  async rejectApplicant(jobRoleId: number, applicationId: number) {
    const application = await prisma.application.findFirst({
      where: { applicationId, jobRoleId },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    if (application.applicationStatus !== "IN_PROGRESS") {
      throw new Error("Only IN_PROGRESS applications can be rejected");
    }

    const updatedApplication = await prisma.application.update({
      where: { applicationId },
      data: { applicationStatus: "REJECTED" },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return {
      message: "Applicant rejected",
      application: {
        applicationId: updatedApplication.applicationId,
        username: updatedApplication.user.email,
        status: updatedApplication.applicationStatus,
      },
    };
  }

  async rejectApplicantById(applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { applicationId },
      select: { jobRoleId: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    return this.rejectApplicant(application.jobRoleId, applicationId);
  }

  async updateApplicationStatusById(applicationId: number, status: string) {
    const normalisedStatus = status.trim().toUpperCase();

    if (
      normalisedStatus === "HIRED" ||
      normalisedStatus === "HIRE" ||
      normalisedStatus === "APPROVED" ||
      normalisedStatus === "APPROVE" ||
      normalisedStatus === "ACCEPTED" ||
      normalisedStatus === "ACCEPT"
    ) {
      return this.hireApplicantById(applicationId);
    }

    if (
      normalisedStatus === "REJECTED" ||
      normalisedStatus === "REJECT" ||
      normalisedStatus === "DECLINED" ||
      normalisedStatus === "DECLINE"
    ) {
      return this.rejectApplicantById(applicationId);
    }

    throw new Error("Unsupported application status");
  }
}
