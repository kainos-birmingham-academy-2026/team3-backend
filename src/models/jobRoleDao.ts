import type {
	CreateApplicationRequestDto,
	CreateJobRoleRequestDto,
	JobRoleFiltersDto,
	UpdateJobRoleRequestDto,
} from "../dtos/jobRoleDto.js";
import type { Prisma } from "../generated/prisma/client.js";
import { StatusEnum } from "../generated/prisma/enums.js";
import prisma from "../prismaClient.js";
import { JobRole } from "./jobRole.js";
import { JobRoleApplication } from "./jobRoleApplication.js";

type JobRoleRow = Prisma.JobRoleGetPayload<{
	include: { status: true; capability: true; band: true; location: true };
}>;

function toJobRoleDomain(row: JobRoleRow): JobRole {
	return new JobRole(
		row.jobRoleId,
		row.roleName,
		row.description,
		row.responsibilities,
		row.sharepointUrl,
		row.numberOfOpenPositions,
		row.closingDate,
		row.capability.capabilityName,
		row.band.bandName,
		row.location.locationName,
		row.location.addressLine1,
		row.location.addressLine2,
		row.location.postcode,
		row.status.statusName,
		row.createdAt,
		row.updatedAt,
	);
}

function toApplicationDomain(
	row: Prisma.ApplicationGetPayload<Record<string, never>>,
): JobRoleApplication {
	return new JobRoleApplication(
		row.applicationId,
		row.jobRoleId,
		row.userId,
		row.cvText,
	);
}

export class JobRoleDao {
	async findAll(filters: JobRoleFiltersDto = {}): Promise<JobRole[]> {
		const closingDate = filters.closingDate
			? new Date(`${filters.closingDate}T00:00:00.000Z`)
			: undefined;
		const nextDay = closingDate
			? new Date(closingDate.getTime() + 24 * 60 * 60 * 1000)
			: undefined;
		const rows = await prisma.jobRole.findMany({
			where: {
				roleName: filters.roleName
					? { contains: filters.roleName, mode: "insensitive" }
					: undefined,
				locationId: filters.locationId ? { in: filters.locationId } : undefined,
				capabilityId: filters.capabilityId
					? { in: filters.capabilityId }
					: undefined,
				bandId: filters.bandId ? { in: filters.bandId } : undefined,
				closingDate:
					closingDate && nextDay
						? { gte: closingDate, lt: nextDay }
						: undefined,
			},
			relationLoadStrategy: "join",
			include: {
				status: true,
				capability: true,
				band: true,
				location: true,
			},
		});
		return rows.map(toJobRoleDomain);
	}

	async findById(jobRoleId: number): Promise<JobRole | null> {
		const row = await prisma.jobRole.findUnique({
			where: { jobRoleId },
			relationLoadStrategy: "join",
			include: {
				status: true,
				capability: true,
				band: true,
				location: true,
			},
		});
		return row ? toJobRoleDomain(row) : null;
	}

	async createJobRole(data: CreateJobRoleRequestDto): Promise<JobRole> {
		const openStatus = await prisma.status.findUniqueOrThrow({
			where: { statusName: StatusEnum.OPEN },
			select: { statusId: true },
		});
		const row = await prisma.jobRole.create({
			data: {
				roleName: data.roleName,
				description: data.description,
				responsibilities: data.responsibilities,
				sharepointUrl: data.sharepointUrl,
				numberOfOpenPositions: data.numberOfOpenPositions,
				closingDate: data.closingDate,
				capabilityId: data.capabilityId,
				bandId: data.bandId,
				locationId: data.locationId,
				statusId: openStatus.statusId,
			},
			relationLoadStrategy: "join",
			include: {
				status: true,
				capability: true,
				band: true,
				location: true,
			},
		});
		return toJobRoleDomain(row);
	}

	async updateJobRole(
		jobRoleId: number,
		data: UpdateJobRoleRequestDto,
	): Promise<JobRole> {
		const row = await prisma.jobRole.update({
			where: { jobRoleId },
			data: {
				roleName: data.roleName,
				description: data.description,
				responsibilities: data.responsibilities,
				sharepointUrl: data.sharepointUrl,
				numberOfOpenPositions: data.numberOfOpenPositions,
				closingDate: data.closingDate,
				capabilityId: data.capabilityId,
				bandId: data.bandId,
				locationId: data.locationId,
			},
			relationLoadStrategy: "join",
			include: {
				status: true,
				capability: true,
				band: true,
				location: true,
			},
		});
		return toJobRoleDomain(row);
	}

	async deleteJobRole(jobRoleId: number): Promise<void> {
		await prisma.jobRole.delete({
			where: { jobRoleId },
		});
	}

	async findApplicationByUserIdAndJobRoleId(
		userId: number,
		jobRoleId: number,
	): Promise<JobRoleApplication | null> {
		const application = await prisma.application.findFirst({
			where: {
				userId,
				jobRoleId,
			},
		});
		return application ? toApplicationDomain(application) : null;
	}

	async createApplication(
		jobRoleId: number,
		userId: number,
		data: CreateApplicationRequestDto,
	): Promise<JobRoleApplication> {
		const application = await prisma.application.create({
			data: {
				jobRoleId: jobRoleId,
				userId: userId,
				cvText: data.cvText,
			},
		});
		return toApplicationDomain(application);
	}

	//get status, band, capability, location for job role creation form
	async getStatus(): Promise<Array<{ statusId: number; statusName: string }>> {
		const rows = await prisma.status.findMany();
		return rows.map((row) => ({
			statusId: row.statusId,
			statusName: row.statusName,
		}));
	}

	async getBands(): Promise<Array<{ bandId: number; bandName: string }>> {
		const rows = await prisma.band.findMany();
		return rows.map((row) => ({ bandId: row.bandId, bandName: row.bandName }));
	}

	async getCapabilities(): Promise<
		Array<{ capabilityId: number; capabilityName: string }>
	> {
		const rows = await prisma.capability.findMany();
		return rows.map((row) => ({
			capabilityId: row.capabilityId,
			capabilityName: row.capabilityName,
		}));
	}

	async getLocations(): Promise<
		Array<{
			locationId: number;
			locationName: string;
			addressLine1: string;
			addressLine2: string | null;
			postcode: string;
		}>
	> {
		const rows = await prisma.location.findMany();
		return rows.map((row) => ({
			locationId: row.locationId,
			locationName: row.locationName,
			addressLine1: row.addressLine1,
			addressLine2: row.addressLine2,
			postcode: row.postcode,
		}));
	}
}
