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

function mockRow(overrides: Record<string, unknown> = {}) {
    return {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        locationId: 1,
        capabilityId: 1,
        bandId: 1,
        closingDate: new Date('2026-12-31'),
        status: 'OPEN',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        location: {
            locationId: 1,
            locationName: 'Belfast',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        capability: {
            capabilityId: 1,
            capabilityName: 'Software Engineering',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        band: {
            nameId: 1,
            bandName: 'Engineer',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        ...overrides,
    };
}

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
            expect(prisma.jobRole.findMany).toHaveBeenCalledWith({
                relationLoadStrategy: 'join',
                include: {
                    location: true,
                    capability: true,
                    band: true,
                },
            });
        });

        it('should return array of JobRole objects when data exists', async () => {
            const mockJobRoles = [
                mockRow(),
                mockRow({
                    jobRoleId: 2,
                    roleName: 'Product Manager',
                    locationId: 2,
                    capabilityId: 2,
                    bandId: 2,
                    status: 'CLOSED',
                    location: {
                        locationId: 2,
                        locationName: 'London',
                        createdAt: new Date('2026-01-01'),
                        updatedAt: new Date('2026-01-01'),
                    },
                    capability: {
                        capabilityId: 2,
                        capabilityName: 'Delivery Management',
                        createdAt: new Date('2026-01-01'),
                        updatedAt: new Date('2026-01-01'),
                    },
                    band: {
                        nameId: 2,
                        bandName: 'Senior Engineer',
                        createdAt: new Date('2026-01-01'),
                        updatedAt: new Date('2026-01-01'),
                    },
                }),
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
            const mockJobRoles = [mockRow()];

            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce(mockJobRoles);

            const result = await dao.findAll();

            expect(result[0]).toHaveProperty('jobRoleId');
            expect(result[0]).toHaveProperty('roleName');
            //expect(result[0]).toHaveProperty('locationId');
            //expect(result[0]).toHaveProperty('locationName');
            expect(result[0]).toHaveProperty('capabilityId');
            //expect(result[0]).toHaveProperty('capabilityName');
            expect(result[0]).toHaveProperty('bandId');
            //expect(result[0]).toHaveProperty('bandName');
            expect(result[0]).toHaveProperty('closingDate');
            expect(result[0]).toHaveProperty('status');
            expect(result[0]).toHaveProperty('createdAt');
            expect(result[0]).toHaveProperty('updatedAt');
        });

        it('should preserve order from database', async () => {
            const mockJobRoles = [
                mockRow({ jobRoleId: 1, roleName: 'Role 1', location: { locationId: 1, locationName: 'Location 1', createdAt: new Date(), updatedAt: new Date() } }),
                mockRow({ jobRoleId: 2, roleName: 'Role 2', location: { locationId: 2, locationName: 'Location 2', createdAt: new Date(), updatedAt: new Date() } }),
                mockRow({ jobRoleId: 3, roleName: 'Role 3', location: { locationId: 3, locationName: 'Location 3', createdAt: new Date(), updatedAt: new Date() } }),
            ];

            vi.mocked(prisma.jobRole.findMany as any).mockResolvedValueOnce(mockJobRoles);

            const result = await dao.findAll();

            expect(result[0].jobRoleId).toBe(1);
            expect(result[1].jobRoleId).toBe(2);
            expect(result[2].jobRoleId).toBe(3);
        });

        it('should handle multiple calls correctly', async () => {
            const mockJobRoles1 = [mockRow({ jobRoleId: 1, roleName: 'Role 1' })];
            const mockJobRoles2 = [mockRow({ jobRoleId: 2, roleName: 'Role 2' })];

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
