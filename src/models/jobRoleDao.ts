import { JobRole } from "./jobRole.js";
import prisma from "../prismaClient.js";
import type { Prisma } from "../generated/prisma/client.js";


type JobRoleRow = Prisma.JobRoleGetPayload<{
    include: { status: true; capability: true; band: true, location: true; };
}>;

function toDomain(row: JobRoleRow): JobRole {
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
        return rows.map(toDomain);
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
        return row ? toDomain(row) : null;
    }
}