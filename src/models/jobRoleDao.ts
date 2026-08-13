import { JobRole } from "./jobRole.js";
import prisma from "../prismaClient.js";
import type { Prisma } from "../generated/prisma/client.js";

import { JobRoleApplication } from "./jobRoleApplication.js";


type JobRoleRow = Prisma.JobRoleGetPayload<{
    include: { status: true; capability: true; band: true, location: true; };
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
        row.updatedAt
    );
}

function toApplicationDomain(row: any): JobRoleApplication {
    return new JobRoleApplication(
        row.applicationId,
        row.jobRoleId,
        row.userId,
        row.cvText
    );
}

export class JobRoleDao {
    async findAll(): Promise<JobRole[]> {
        const rows = await prisma.jobRole.findMany({
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

    async createJobRole(data: any): Promise<JobRole> {
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
                statusId: 1, // Assuming 1 is the ID for OPEN status
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

    async findApplicationByUserIdAndJobRoleId(userId: number, jobRoleId: number): Promise<JobRoleApplication | null> {
        const application = await prisma.application.findFirst({
            where: {
                userId,
                jobRoleId,
            },
        });
        return application ? toApplicationDomain(application) : null;
    }

    async createApplication(data: any): Promise<JobRoleApplication> {
        const application = await prisma.application.create({
            data: {
                jobRoleId: data.jobRoleId,
                userId: data.userId,
                cvText: data.cvText,
            },
        });
        return toApplicationDomain(application);

    }
}