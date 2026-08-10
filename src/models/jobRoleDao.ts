import { JobRole } from "./jobRole.js";
import prisma from "../prismaClient.js";
import type { Prisma } from "../generated/prisma/client.js";


type JobRoleRow = Prisma.JobRoleGetPayload<{
    include: { location: true; capability: true; band: true };
}>;

function toDomain(row: JobRoleRow): JobRole {
    return new JobRole(
        row.jobRoleId,
        row.roleName,
        row.locationId,
        row.location.locationName,
        row.capabilityId,
        row.capability.capabilityName,
        row.bandId,
        row.band.bandName,
        row.closingDate,
        row.status,
        row.createdAt,
        row.updatedAt
    );
}

export class JobRoleDao {
    async findAll(): Promise<JobRole[]> {
        const rows = await prisma.jobRole.findMany({
            relationLoadStrategy: "join",
            include: {
                location: true,
                capability: true,
                band: true,
            },
        });
        return rows.map(toDomain);
    }
}