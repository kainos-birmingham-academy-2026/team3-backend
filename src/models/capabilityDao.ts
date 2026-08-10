import prisma from "../prismaClient.js";

export class CapabilityDao {
    async findAll() {
        return await prisma.capability.findMany();
    }

    async findById(capabilityId: number) {
        return await prisma.capability.findUnique({
            where: { capabilityId },
        });
    }

    async create(capabilityName: string) {
        return await prisma.capability.create({
            data: { capabilityName },
        });
    }

    async findByName(capabilityName: string) {
        return await prisma.capability.findUnique({
            where: { capabilityName },
        });
    }
}
