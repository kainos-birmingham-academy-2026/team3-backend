import prisma from "../prismaClient";

type ApplicationListItem = {
	applicationId: number;
	jobRoleId: number;
	cvText: string;
	createdAt: Date;
	applicationStatus: "IN_PROGRESS" | "HIRED" | "REJECTED" | "WITHDRAWN";
	jobRole: {
		roleName: string;
	};
};

export class UserApplicationsService {
	private readonly applicationListSelect = {
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
	} as const;

	private mapApplications(applications: ApplicationListItem[]) {
		return applications.map((application) => ({
			applicationId: application.applicationId,
			jobRoleId: application.jobRoleId,
			roleName: application.jobRole.roleName,
			applicationDate: application.createdAt,
			cvText: application.cvText,
			status: application.applicationStatus,
		}));
	}

	async findAllForUser(userId: number) {
		const applications = await prisma.application.findMany({
			where: { userId },
			orderBy: { createdAt: "desc" },
			select: this.applicationListSelect,
		});

		return this.mapApplications(applications);
	}

	async withdrawApplication(applicationId: number, userId: number) {
		const application = await prisma.application.findFirst({
			where: { applicationId, userId },
			select: { applicationStatus: true },
		});

		if (!application) {
			throw new Error("Application not found");
		}

		if (application.applicationStatus !== "IN_PROGRESS") {
			throw new Error("Only IN_PROGRESS applications can be withdrawn");
		}

		const updatedApplication = await prisma.application.updateMany({
			where: { applicationId, userId, applicationStatus: "IN_PROGRESS" },
			data: { applicationStatus: "WITHDRAWN" },
		});

		if (updatedApplication.count === 0) {
			throw new Error("Only IN_PROGRESS applications can be withdrawn");
		}

		return { message: "Application withdrawn" };
	}
}
