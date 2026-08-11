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
        description: 'Build and maintain software systems',
        responsibilities: 'Code development, testing, deployment',
        sharepointUrl: 'https://sharepoint.example.com/roles/1',
        numberOfOpenPositions: 2,
        closingDate: new Date('2026-12-31'),
        capabilityId: 1,
        bandId: 1,
        locationId: 1,
        statusId: 1,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        location: {
            locationId: 1,
            locationName: 'Belfast',
            addressLine1: '123 Street',
            addressLine2: null,
            postcode: 'BT1 1AA',
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
            bandId: 1,
            bandName: 'Engineer',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-01'),
        },
        status: {
            statusId: 1,
            statusName: 'OPEN',
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
                    status: true,
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
                    description: 'Manage product strategy',
                    responsibilities: 'Define roadmap, coordinate releases',
                    sharepointUrl: 'https://sharepoint.example.com/roles/2',
                    numberOfOpenPositions: 1,
                    statusId: 2,
                    locationId: 2,
                    capabilityId: 2,
                    bandId: 2,
                    location: {
                        locationId: 2,
                        locationName: 'London',
                        addressLine1: '456 Avenue',
                        addressLine2: null,
                        postcode: 'SW1A 1AA',
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
                        bandId: 2,
                        bandName: 'Senior Engineer',
                        createdAt: new Date('2026-01-01'),
                        updatedAt: new Date('2026-01-01'),
                    },
                    status: {
                        statusId: 2,
                        statusName: 'CLOSED',
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
            expect(result[0]).toHaveProperty('description');
            expect(result[0]).toHaveProperty('responsibilities');
            expect(result[0]).toHaveProperty('sharepointUrl');
            expect(result[0]).toHaveProperty('numberOfOpenPositions');
            expect(result[0]).toHaveProperty('capabilityName');
            expect(result[0]).toHaveProperty('bandName');
            expect(result[0]).toHaveProperty('locationName');
            expect(result[0]).toHaveProperty('statusName');
            expect(result[0]).toHaveProperty('closingDate');
            expect(result[0]).toHaveProperty('createdAt');
            expect(result[0]).toHaveProperty('updatedAt');
        });

        it('should preserve order from database', async () => {
            const mockJobRoles = [
                mockRow({ 
                    jobRoleId: 1, 
                    roleName: 'Role 1', 
                    location: { locationId: 1, locationName: 'Location 1', addressLine1: 'addr1', addressLine2: null, postcode: 'post1', createdAt: new Date(), updatedAt: new Date() },
                    status: { statusId: 1, statusName: 'OPEN', createdAt: new Date(), updatedAt: new Date() }
                }),
                mockRow({ 
                    jobRoleId: 2, 
                    roleName: 'Role 2', 
                    location: { locationId: 2, locationName: 'Location 2', addressLine1: 'addr2', addressLine2: null, postcode: 'post2', createdAt: new Date(), updatedAt: new Date() },
                    status: { statusId: 1, statusName: 'OPEN', createdAt: new Date(), updatedAt: new Date() }
                }),
                mockRow({ 
                    jobRoleId: 3, 
                    roleName: 'Role 3', 
                    location: { locationId: 3, locationName: 'Location 3', addressLine1: 'addr3', addressLine2: null, postcode: 'post3', createdAt: new Date(), updatedAt: new Date() },
                    status: { statusId: 1, statusName: 'OPEN', createdAt: new Date(), updatedAt: new Date() }
                }),
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
