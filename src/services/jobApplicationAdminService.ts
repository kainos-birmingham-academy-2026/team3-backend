import type { Prisma } from "../generated/prisma/client";
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
	user: {
		id: number;
		email: string;
	};
};

type AdminApplicationsQuery = {
	jobRoleId?: number;
	search?: string;
	status?: "IN_PROGRESS" | "HIRED" | "REJECTED" | "WITHDRAWN";
	role?: string;
	location?: string;
	page: number;
	pageSize: number;
};

export class JobApplicationAdminService {
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
		user: {
			select: {
				id: true,
				email: true,
			},
		},
	} as const;

	private mapApplications(applications: ApplicationListItem[]) {
		return applications.map((application) => ({
			applicationId: application.applicationId,
			jobRoleId: application.jobRoleId,
			applicantEmail: application.user.email,
			roleName: application.jobRole.roleName,
			applicationDate: application.createdAt,
			cvText: application.cvText,
			status: application.applicationStatus,
			actions:
				application.applicationStatus === "IN_PROGRESS"
					? { canHire: true, canReject: true }
					: undefined,
		}));
	}

	async findAllAdmin({
		jobRoleId,
		search,
		status,
		role,
		location,
		page,
		pageSize,
	}: AdminApplicationsQuery) {
		const where = {
			jobRoleId,
			applicationStatus: status,
			user: search
				? { email: { contains: search, mode: "insensitive" } }
				: undefined,
			jobRole:
				role || location
					? {
							roleName: role,
							location: location ? { locationName: location } : undefined,
						}
					: undefined,
		} satisfies Prisma.ApplicationWhereInput;
		const hasFilters = Object.values(where).some((value) => value !== undefined);
		const queryWhere = hasFilters ? where : undefined;
		const [applications, totalItems] = await Promise.all([
			prisma.application.findMany({
				...(queryWhere === undefined ? {} : { where: queryWhere }),
				orderBy: { createdAt: "desc" },
				skip: (page - 1) * pageSize,
				take: pageSize,
				select: this.applicationListSelect,
			}),
			prisma.application.count(
				queryWhere === undefined ? undefined : { where: queryWhere },
			),
		]);

		return {
			items: this.mapApplications(applications),
			page,
			pageSize,
			totalItems,
			totalPages: Math.ceil(totalItems / pageSize),
		};
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

			const updatedRole = await tx.jobRole.updateMany({
				where: { jobRoleId, numberOfOpenPositions: { gt: 0 } },
				data: { numberOfOpenPositions: { decrement: 1 } },
			});

			if (updatedRole.count === 0) {
				throw new Error("No open positions remaining for this role");
			}

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

			console.info("Admin action: application hired", {
				applicationId: updatedApplication.applicationId,
				jobRoleId,
				status: updatedApplication.applicationStatus,
				applicant: updatedApplication.user.email,
			});

			return {
				message: "Applicant hired",
				application: {
					applicationId: updatedApplication.applicationId,
					applicantEmail: updatedApplication.user.email,
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

		console.info("Admin action: application rejected", {
			applicationId: updatedApplication.applicationId,
			jobRoleId,
			status: updatedApplication.applicationStatus,
			applicant: updatedApplication.user.email,
		});

		return {
			message: "Applicant rejected",
			application: {
				applicationId: updatedApplication.applicationId,
				applicantEmail: updatedApplication.user.email,
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
		if (status === "HIRED") {
			return this.hireApplicantById(applicationId);
		}

		if (status === "REJECTED") {
			return this.rejectApplicantById(applicationId);
		}

		throw new Error("Unsupported application status");
	}
}
