import type { JobRole } from "./jobRole.js";
import prisma from "../prismaClient.js";

export class JobRoleDao {
    async findAll(): Promise<JobRole[]> {
        return await prisma.jobRole.findMany();
    }
}