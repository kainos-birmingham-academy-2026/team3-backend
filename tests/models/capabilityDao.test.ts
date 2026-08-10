import { describe, it, expect, afterEach } from 'vitest';
import { CapabilityDao } from '../../src/models/capabilityDao.ts';
import prisma from '../../src/prismaClient.ts';

describe('CapabilityDao - Unique Constraint', () => {
    const dao = new CapabilityDao();


    it('should reject duplicate capabilityName', async () => {
        await dao.create('Mhadi');
        
        await expect(dao.create('Mhadi')).rejects.toThrow();
    });
});
