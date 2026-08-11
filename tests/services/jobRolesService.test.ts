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
                    description: 'Build software',
                    responsibilities: 'Development',
                    sharepointUrl: 'https://sharepoint.example.com/roles/1',
                    numberOfOpenPositions: 2,
                    locationName: 'Birmingham',
                    capabilityName: 'Software Engineering',
                    bandName: 'Engineer',
                    statusName: 'OPEN',
                    closingDate: new Date('2026-12-31'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const mockResponse = {
                jobRoleId: 1,
                roleName: 'Software Engineer',
                description: 'Build software',
                responsibilities: 'Development',
                sharepointUrl: 'https://sharepoint.example.com/roles/1',
                numberOfOpenPositions: 2,
                locationName: 'Birmingham',
                capabilityName: 'Software Engineering',
                bandName: 'Engineer',
                statusName: 'OPEN',
                closingDate: new Date('2026-12-31'),
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
                    description: 'Build software',
                    responsibilities: 'Development',
                    sharepointUrl: 'https://sharepoint.example.com/roles/1',
                    numberOfOpenPositions: 2,
                    locationName: 'Birmingham',
                    capabilityName: 'Software Engineering',
                    bandName: 'Engineer',
                    statusName: 'OPEN',
                    closingDate: new Date('2026-12-31'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const mockResponse = {
                jobRoleId: 1,
                roleName: 'Software Engineer',
                description: 'Build software',
                responsibilities: 'Development',
                sharepointUrl: 'https://sharepoint.example.com/roles/1',
                numberOfOpenPositions: 2,
                locationName: 'Birmingham',
                capabilityName: 'Software Engineering',
                bandName: 'Engineer',
                statusName: 'OPEN',
                closingDate: new Date('2026-12-31'),
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
                    description: 'Desc1',
                    responsibilities: 'Resp1',
                    sharepointUrl: 'https://sharepoint.example.com/roles/1',
                    numberOfOpenPositions: 1,
                    locationName: 'Location 1',
                    capabilityName: 'Capability1',
                    bandName: 'Band1',
                    statusName: 'OPEN',
                    closingDate: new Date('2026-12-31'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    jobRoleId: 2,
                    roleName: 'Role 2',
                    description: 'Desc2',
                    responsibilities: 'Resp2',
                    sharepointUrl: 'https://sharepoint.example.com/roles/2',
                    numberOfOpenPositions: 2,
                    locationName: 'Location 2',
                    capabilityName: 'Capability2',
                    bandName: 'Band2',
                    statusName: 'OPEN',
                    closingDate: new Date('2026-12-31'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    jobRoleId: 3,
                    roleName: 'Role 3',
                    description: 'Desc3',
                    responsibilities: 'Resp3',
                    sharepointUrl: 'https://sharepoint.example.com/roles/3',
                    numberOfOpenPositions: 3,
                    locationName: 'Location 3',
                    capabilityName: 'Capability3',
                    bandName: 'Band3',
                    statusName: 'OPEN',
                    closingDate: new Date('2026-12-31'),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            const mockResponses = mockJobRoles.map(role => ({
                jobRoleId: role.jobRoleId,
                roleName: role.roleName,
                description: role.description,
                responsibilities: role.responsibilities,
                sharepointUrl: role.sharepointUrl,
                numberOfOpenPositions: role.numberOfOpenPositions,
                locationName: role.locationName,
                capabilityName: role.capabilityName,
                bandName: role.bandName,
                statusName: role.statusName,
                closingDate: role.closingDate,
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
                description: `Desc ${i + 1}`,
                responsibilities: `Resp ${i + 1}`,
                sharepointUrl: `https://sharepoint.example.com/roles/${i + 1}`,
                numberOfOpenPositions: i + 1,
                locationName: `Location ${i + 1}`,
                capabilityName: `Capability ${i + 1}`,
                bandName: `Band ${i + 1}`,
                statusName: 'OPEN',
                closingDate: new Date('2026-12-31'),
                createdAt: new Date(),
                updatedAt: new Date(),
            }));

            const mockResponses = mockJobRoles.map(role => ({
                jobRoleId: role.jobRoleId,
                roleName: role.roleName,
                description: role.description,
                responsibilities: role.responsibilities,
                sharepointUrl: role.sharepointUrl,
                numberOfOpenPositions: role.numberOfOpenPositions,
                locationName: role.locationName,
                capabilityName: role.capabilityName,
                bandName: role.bandName,
                statusName: role.statusName,
                closingDate: role.closingDate,
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
