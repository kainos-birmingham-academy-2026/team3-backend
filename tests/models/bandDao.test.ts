import { describe, it, expect, afterEach } from 'vitest';
import { BandDao } from '../../src/models/bandDao.ts';
import prisma from '../../src/prismaClient.ts';

describe('BandDao - Unique Constraint', () => {
    const dao = new BandDao();

    it('should reject duplicate bandName', async () => {
        await dao.create('Mhadi');
        
        await expect(dao.create('Mhadi')).rejects.toThrow();
    });
});
