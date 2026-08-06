import prisma from "../prismaClient.js";
import type { JobRole } from "../generated/prisma/client.js";

export class JobRolesService {
    async findAll(): Promise<JobRole[]> {
        return await prisma.jobRole.findMany();
    }
}