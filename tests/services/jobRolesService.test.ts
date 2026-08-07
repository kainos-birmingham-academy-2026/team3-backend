import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { JobRolesService } from '../../src/services/jobRolesService.ts';
import type { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';

// Create mock functions that will be used throughout tests
const mockFindAll = vi.fn() as Mock<() => Promise<any[]>>;
const mockToResponse = vi.fn() as Mock<(jobRole: any) => JobRoleResponse>;

// Mock the dependencies
vi.mock('../../src/models/jobRoleDao.ts', () => {
    return {
        JobRoleDao: class {
            async findAll() {
                return mockFindAll();
            }
        },
    };
});

vi.mock('../../src/mappers/jobRoleMapper.ts', () => {
    return {
        JobRoleMapper: class {
            toResponse(jobRole: any) {
                return mockToResponse(jobRole);
            }
        },
    };
});

describe('JobRolesService', () => {
    let service: JobRolesService;

    beforeEach(() => {
        vi.clearAllMocks();
        service = new JobRolesService();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('findAll()', () => {
        it('should call jobRoleDao.findAll()', async () => {
            mockFindAll.mockResolvedValueOnce([]);

            await service.findAll();

            expect(mockFindAll).toHaveBeenCalledTimes(1);
        });

        it('should map each JobRole to JobRoleResponse', async () => {
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
            ];

            const mockResponse = {
                jobRoleId: 1,
                roleName: 'Software Engineer',
                location: 'Birmingham',
                capabilityId: 1,
                bandId: 1,
                closingDate: new Date('2026-12-31'),
                status: 'OPEN',
            };

            mockFindAll.mockResolvedValueOnce(mockJobRoles);
            mockToResponse.mockReturnValueOnce(mockResponse);

            await service.findAll();

            expect(mockToResponse).toHaveBeenCalledTimes(1);
            expect(mockToResponse).toHaveBeenCalledWith(mockJobRoles[0]);
        });

        it('should return array of JobRoleResponse objects', async () => {
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
            ];

            const mockResponse = {
                jobRoleId: 1,
                roleName: 'Software Engineer',
                location: 'Birmingham',
                capabilityId: 1,
                bandId: 1,
                closingDate: new Date('2026-12-31'),
                status: 'OPEN',
            };

            mockFindAll.mockResolvedValueOnce(mockJobRoles);
            mockToResponse.mockReturnValueOnce(mockResponse);

            const result = await service.findAll();

            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(1);
            expect(result[0]).toEqual(mockResponse);
        });

        it('should return empty array when DAO returns empty array', async () => {
            mockFindAll.mockResolvedValueOnce([]);

            const result = await service.findAll();

            expect(result).toHaveLength(0);
            expect(Array.isArray(result)).toBe(true);
        });

        it('should throw error when DAO throws error', async () => {
            const error = new Error('Database error');
            mockFindAll.mockRejectedValueOnce(error);

            await expect(service.findAll()).rejects.toThrow('Database error');
        });

        it('should preserve job role order from DAO', async () => {
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
                    closingDate: new Date('2026-12-31'),
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
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const mockResponses = mockJobRoles.map(role => ({
                jobRoleId: role.jobRoleId,
                roleName: role.roleName,
                location: role.location,
                capabilityId: role.capabilityId,
                bandId: role.bandId,
                closingDate: role.closingDate,
                status: role.status,
            }));

            mockFindAll.mockResolvedValueOnce(mockJobRoles);
            mockResponses.forEach((response) => {
                mockToResponse.mockReturnValueOnce(response);
            });

            const result = await service.findAll();

            expect(result[0].jobRoleId).toBe(1);
            expect(result[1].jobRoleId).toBe(2);
            expect(result[2].jobRoleId).toBe(3);
        });

        it('should handle multiple job roles correctly', async () => {
            const mockJobRoles = Array.from({ length: 5 }, (_, i) => ({
                jobRoleId: i + 1,
                roleName: `Role ${i + 1}`,
                location: `Location ${i + 1}`,
                capabilityId: i + 1,
                bandId: i + 1,
                closingDate: new Date('2026-12-31'),
                status: 'OPEN',
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            const mockResponses = mockJobRoles.map(role => ({
                jobRoleId: role.jobRoleId,
                roleName: role.roleName,
                location: role.location,
                capabilityId: role.capabilityId,
                bandId: role.bandId,
                closingDate: role.closingDate,
                status: role.status,
            }));

            mockFindAll.mockResolvedValueOnce(mockJobRoles);
            mockResponses.forEach((response) => {
                mockToResponse.mockReturnValueOnce(response);
            });

            const result = await service.findAll();

            expect(result).toHaveLength(5);
            expect(mockToResponse).toHaveBeenCalledTimes(5);
        });
    });
});
