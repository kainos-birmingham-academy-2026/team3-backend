import { JobRole } from "./jobRole.js";
import prisma from "../prismaClient.js";
import type { Prisma } from "../generated/prisma/client.js";

import { JobRoleApplication } from "./jobRoleApplication.js";
import { CreateJobRoleRequestDto, CreateApplicationRequestDto, UpdateJobRoleRequestDto } from "../dtos/jobRoleDto.js";


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

    async createJobRole(data: CreateJobRoleRequestDto): Promise<JobRole> {
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
                statusId: 1, // Assuming 1 is the ID for OPEN status can be changed in future 
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

    async updateJobRole(jobRoleId: number, data: UpdateJobRoleRequestDto): Promise<JobRole> {
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

    async findApplicationByUserIdAndJobRoleId(userId: number, jobRoleId: number): Promise<JobRoleApplication | null> {
        const application = await prisma.application.findFirst({
            where: {
                userId,
                jobRoleId,
            },
        });
        return application ? toApplicationDomain(application) : null;
    }

    async createApplication(jobRoleId: number, userId: number, data: CreateApplicationRequestDto): Promise<JobRoleApplication> {
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
    async getStatus(): Promise<any[]> {
        const rows = await prisma.status.findMany();
        return rows.map(row => ({ statusId: row.statusId, statusName: row.statusName }));
    }

    async getBands(): Promise<any[]> {
        const rows = await prisma.band.findMany();
        return rows.map(row => ({ bandId: row.bandId, bandName: row.bandName }));
    }

    async getCapabilities(): Promise<any[]> {
        const rows = await prisma.capability.findMany();
        return rows.map(row => ({ capabilityId: row.capabilityId, capabilityName: row.capabilityName }));
    }

    async getLocations(): Promise<any[]> {
        const rows = await prisma.location.findMany();
        return rows.map(row => ({
            locationId: row.locationId,
            locationName: row.locationName,
            addressLine1: row.addressLine1,
            addressLine2: row.addressLine2,
            postcode: row.postcode
        }));
    }
}