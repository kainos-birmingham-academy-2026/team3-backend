import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Prisma client FIRST before importing JobRoleDao
vi.mock('../../src/prismaClient.ts', () => ({
    default: {
        jobRole: {
            findMany: vi.fn(),
        },
    },
}));

import { JobRoleDao } from '../../src/models/jobRoleDao.ts';
import prisma from '../../src/prismaClient.ts';

describe('JobRoleDao', () => {
    let dao: JobRoleDao;

    beforeEach(() => {
        vi.clearAllMocks();
        dao = new JobRoleDao();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('findAll()', () => {
        it('should query database using Prisma client', async () => {
            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce([]);

            await dao.findAll();

            expect(prisma.jobRole.findMany).toHaveBeenCalledTimes(1);
        });

        it('should return array of JobRole objects when data exists', async () => {
            const mockJobRoles = [
                {
                    jobRoleId: 1,
                    roleName: 'Software Engineer',
                    location: 'Birmingham',
                    capabilityId: 1,
                    bandId: 1,
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    jobRoleId: 2,
                    roleName: 'Product Manager',
                    location: 'London',
                    capabilityId: 2,
                    bandId: 2,
                    closingDate: new Date('2026-11-30'),
                    status: 'CLOSED',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce(mockJobRoles);

            const result = await dao.findAll();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        it('should return empty array when no job roles in database', async () => {
            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce([]);

            const result = await dao.findAll();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });

        it('should throw error when database connection fails', async () => {
            const connectionError = new Error('Database connection failed');
            vi.mocked(prisma.jobRole.findMany as any).mockRejectedValueOnce(connectionError);

            await expect(dao.findAll()).rejects.toThrow('Database connection failed');
        });

        it('should throw error when query fails', async () => {
            const queryError = new Error('Query failed');
            vi.mocked(prisma.jobRole.findMany as any).mockRejectedValueOnce(queryError);

            await expect(dao.findAll()).rejects.toThrow('Query failed');
        });

        it('should return data with all fields', async () => {
            const mockJobRoles = [
                {
                    jobRoleId: 1,
                    roleName: 'Developer',
                    location: 'Location',
                    capabilityId: 1,
                    bandId: 1,
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                    createdAt: new Date('2026-01-01'),
                    updatedAt: new Date('2026-01-01'),
                },
            ];

            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce(mockJobRoles);

            const result = await dao.findAll();

            expect(result[0]).toHaveProperty('jobRoleId');
            expect(result[0]).toHaveProperty('roleName');
            expect(result[0]).toHaveProperty('location');
            expect(result[0]).toHaveProperty('capabilityId');
            expect(result[0]).toHaveProperty('bandId');
            expect(result[0]).toHaveProperty('closingDate');
            expect(result[0]).toHaveProperty('status');
            expect(result[0]).toHaveProperty('createdAt');
            expect(result[0]).toHaveProperty('updatedAt');
        });

        it('should preserve order from database', async () => {
            const mockJobRoles = [
                {
                    jobRoleId: 1,
                    roleName: 'Role 1',
                    location: 'Location 1',
                    capabilityId: 1,
                    bandId: 1,
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    jobRoleId: 2,
                    roleName: 'Role 2',
                    location: 'Location 2',
                    capabilityId: 2,
                    bandId: 2,
                    closingDate: new Date('2026-11-30'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    jobRoleId: 3,
                    roleName: 'Role 3',
                    location: 'Location 3',
                    capabilityId: 3,
                    bandId: 3,
                    closingDate: new Date('2026-10-30'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce(mockJobRoles);

            const result = await dao.findAll();

            expect(result[0].jobRoleId).toBe(1);
            expect(result[1].jobRoleId).toBe(2);
            expect(result[2].jobRoleId).toBe(3);
        });

        it('should handle multiple calls correctly', async () => {
            const mockJobRoles1 = [
                {
                    jobRoleId: 1,
                    roleName: 'Role 1',
                    location: 'Location 1',
                    capabilityId: 1,
                    bandId: 1,
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const mockJobRoles2 = [
                {
                    jobRoleId: 2,
                    roleName: 'Role 2',
                    location: 'Location 2',
                    capabilityId: 2,
                    bandId: 2,
                    closingDate: new Date('2026-11-30'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            vi.mocked(prisma.jobRole.findMany as any)
                .mockResolvedValueOnce(mockJobRoles1)
                .mockResolvedValueOnce(mockJobRoles2);

            const result1 = await dao.findAll();
            const result2 = await dao.findAll();

            expect(result1).toHaveLength(1);
            expect(result1[0].jobRoleId).toBe(1);
            expect(result2).toHaveLength(1);
            expect(result2[0].jobRoleId).toBe(2);
        });

        it('should handle Prisma-specific errors', async () => {
            const prismaError = new Error('P1000: Authentication failed against database server');
            vi.mocked(prisma.jobRole.findMany as any).mockRejectedValueOnce(prismaError);

            await expect(dao.findAll()).rejects.toThrow('P1000: Authentication failed against database server');
        });
    });
});
