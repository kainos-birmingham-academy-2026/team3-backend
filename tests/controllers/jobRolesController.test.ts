import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { JobRolesController } from '../../src/controllers/jobRolesController.ts';
import type { JobRolesService } from '../../src/services/jobRolesService.ts';
import type { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';
import type { Request, Response } from 'express';

describe('JobRolesController', () => {
    let controller: JobRolesController;
    let mockFindAll: Mock<() => Promise<JobRoleResponse[]>>;
    let mockService: JobRolesService;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let statusSpy: Mock;
    let sendSpy: Mock;
    let jsonSpy: Mock;

    beforeEach(() => {
        // Setup mock response
        statusSpy = vi.fn().mockReturnThis();
        sendSpy = vi.fn().mockReturnThis();
        jsonSpy = vi.fn().mockReturnThis();

        // Create mock service with proper type
        mockFindAll = vi.fn() as Mock<() => Promise<JobRoleResponse[]>>;
        mockService = {
            findAll: mockFindAll,
        } as unknown as JobRolesService;

        mockResponse = {
            status: statusSpy as any,
            send: sendSpy as any,
            json: jsonSpy as any,
        };

        mockRequest = {};

        controller = new JobRolesController(mockService);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getAll()', () => {
        it('should return 200 status with job roles', async () => {
            const mockJobRoles = [
                {
                    jobRoleId: 1,
                    roleName: 'Software Engineer',
                    location: 'Birmingham',
                    capabilityId: 1,
                    bandId: 1,
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                },
            ];

            vi.mocked(mockFindAll).mockResolvedValueOnce(mockJobRoles);

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(statusSpy).toHaveBeenCalledWith(200);
            expect(sendSpy).toHaveBeenCalledWith(mockJobRoles);
        });

        it('should call service.findAll() method', async () => {
            const mockJobRoles: any[] = [];
            vi.mocked(mockFindAll).mockResolvedValueOnce(mockJobRoles);

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(mockFindAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 error when service throws', async () => {
            vi.mocked(mockFindAll).mockRejectedValueOnce(
                new Error('Service error')
            );

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(statusSpy).toHaveBeenCalledWith(500);
            expect(jsonSpy).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });

        it('should handle service returning empty array', async () => {
            vi.mocked(mockFindAll).mockResolvedValueOnce([]);

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(statusSpy).toHaveBeenCalledWith(200);
            expect(sendSpy).toHaveBeenCalledWith([]);
        });

        it('should handle database errors gracefully', async () => {
            const dbError = new Error('Database connection failed');
            vi.mocked(mockFindAll).mockRejectedValueOnce(dbError);

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(statusSpy).toHaveBeenCalledWith(500);
            expect(jsonSpy).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });

        it('should chain status and send correctly', async () => {
            const mockJobRoles = [
                {
                    jobRoleId: 1,
                    roleName: 'Developer',
                    location: 'London',
                    capabilityId: 1,
                    bandId: 2,
                    closingDate: new Date('2026-12-31'),
                    status: 'OPEN',
                },
            ];

            vi.mocked(mockFindAll).mockResolvedValueOnce(mockJobRoles);

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(statusSpy).toHaveBeenCalledBefore(sendSpy);
            expect(statusSpy).toHaveBeenCalledWith(200);
            expect(sendSpy).toHaveBeenCalledWith(mockJobRoles);
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network timeout');
            vi.mocked(mockFindAll).mockRejectedValueOnce(networkError);

            await controller.getAll(mockRequest as Request, mockResponse as Response);

            expect(statusSpy).toHaveBeenCalledWith(500);
            expect(jsonSpy).toHaveBeenCalledWith({ error: 'Internal Server Error' });
        });
    });
});
