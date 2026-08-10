import prisma from "../prismaClient.js";

export class BandDao {
    async findAll() {
        return await prisma.band.findMany();
    }

    async findById(nameId: number) {
        return await prisma.band.findUnique({
            where: { nameId },
        });
    }

    async create(bandName: string) {
        return await prisma.band.create({
            data: { bandName },
        });
    }

    async findByName(bandName: string) {
        return await prisma.band.findUnique({
            where: { bandName },
        });
    }
}
