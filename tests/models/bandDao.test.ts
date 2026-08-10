import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BandDao } from '../../src/models/bandDao.ts';
import prisma from '../../src/prismaClient.ts';

vi.mock('../../src/prismaClient.ts', () => ({
    default: {
        band: {
            create: vi.fn(),
        },
    },
}));


describe('BandDao - Unique Constraint', () => {
    const dao = new BandDao();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should reject duplicate bandName', async () => {
        vi.mocked(prisma.band.create as any).mockResolvedValueOnce({ nameId: 1, bandName: 'Mhadi', createdAt: new Date(), updatedAt: new Date() })
        .mockRejectedValueOnce(new Error('Unique constraint failed on the fields: (`bandName`)'));

        await dao.create('Mhadi');
        await expect(dao.create('Mhadi')).rejects.toThrow();
    });
});
