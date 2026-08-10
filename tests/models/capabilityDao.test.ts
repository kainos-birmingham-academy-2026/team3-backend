import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CapabilityDao } from '../../src/models/capabilityDao.ts';
import prisma from '../../src/prismaClient.ts';

vi.mock('../../src/prismaClient.ts', () => ({
    default: {
        capability: {
            create: vi.fn(),
        },
    },
}));


describe('CapabilityDao - Unique Constraint', () => {
    const dao = new CapabilityDao();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should reject duplicate capabilityName', async () => {
        vi.mocked(prisma.capability.create as any)
            .mockResolvedValueOnce({ capabilityId: 1, capabilityName: 'Mhadi', createdAt: new Date(), updatedAt: new Date() })
            .mockRejectedValueOnce(new Error('Unique constraint failed on the fields: (`capabilityName`)'));

        await dao.create('Mhadi');
        await expect(dao.create('Mhadi')).rejects.toThrow();
    });
});
