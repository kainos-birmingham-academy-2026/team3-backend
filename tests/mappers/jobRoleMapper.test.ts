import { describe, it, expect, beforeEach } from 'vitest';
import { JobRoleMapper } from '../../src/mappers/jobRoleMapper.ts';
import { JobRole } from '../../src/models/jobRole.ts';

describe('JobRoleMapper', () => {
    let mapper: JobRoleMapper;

    beforeEach(() => {
        mapper = new JobRoleMapper();
    });

    describe('toResponse()', () => {
        it('should transform JobRole to JobRoleResponse correctly', () => {
            const jobRole = new JobRole(
                1,
                'Software Engineer',
                'Build and maintain software systems',
                'Code development, testing, deployment',
                'https://sharepoint.example.com/roles/1',
                2,
                new Date('2026-12-31'),
                'Software Engineering',
                'Engineer',
                'Birmingham',
                'OPEN',
                new Date('2026-01-01'),
                new Date('2026-01-01')
            );

            const response = mapper.toResponse(jobRole);

            expect(response).toBeDefined();
            expect(response.jobRoleId).toBe(1);
            expect(response.roleName).toBe('Software Engineer');
            expect(response.description).toBe('Build and maintain software systems');
            expect(response.responsibilities).toBe('Code development, testing, deployment');
            expect(response.sharepointUrl).toBe('https://sharepoint.example.com/roles/1');
            expect(response.numberOfOpenPositions).toBe(2);
            expect(response.locationName).toBe('Birmingham');
            expect(response.capabilityName).toBe('Software Engineering');
            expect(response.bandName).toBe('Engineer');
            expect(response.statusName).toBe('OPEN');
        });

        it('should map jobRoleId field correctly', () => {
            const jobRole = new JobRole(
                42,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.jobRoleId).toBe(42);
        });

        it('should map roleName field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Senior Developer',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.roleName).toBe('Senior Developer');
        });

        it('should map description field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Test Description Content',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.description).toBe('Test Description Content');
        });

        it('should map responsibilities field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Test Responsibilities',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.responsibilities).toBe('Test Responsibilities');
        });

        it('should map sharepointUrl field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'https://sharepoint.example.com/role123',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.sharepointUrl).toBe('https://sharepoint.example.com/role123');
        });

        it('should map numberOfOpenPositions field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                7,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.numberOfOpenPositions).toBe(7);
        });

        it('should map locationName field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Manchester',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.locationName).toBe('Manchester');
        });

        it('should map capabilityName field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Data & AI',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.capabilityName).toBe('Data & AI');
        });

        it('should map bandName field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Senior Engineer',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.bandName).toBe('Senior Engineer');
        });

        it('should map closingDate field correctly', () => {
            const closingDate = new Date('2026-12-31');
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                closingDate,
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.closingDate).toEqual(closingDate);
        });

        it('should map statusName field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'CLOSED',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.statusName).toBe('CLOSED');
        });

        it('should exclude createdAt from response', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date('2026-01-01'),
                new Date('2026-01-01')
            );

            const response = mapper.toResponse(jobRole);

            expect(response).not.toHaveProperty('createdAt');
        });

        it('should exclude updatedAt from response', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date('2026-01-01'),
                new Date('2026-01-01')
            );

            const response = mapper.toResponse(jobRole);

            expect(response).not.toHaveProperty('updatedAt');
        });

        it('should handle Date objects correctly in closingDate field', () => {
            const closingDate = new Date('2026-06-15T10:30:00Z');
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                closingDate,
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.closingDate).toBeInstanceOf(Date);
            expect(response.closingDate.getTime()).toBe(closingDate.getTime());
        });

        it('should handle multiple transformations independently', () => {
            const jobRole1 = new JobRole(
                1,
                'Role 1',
                'Desc1',
                'Resp1',
                'URL1',
                1,
                new Date('2026-12-31'),
                'Capability 1',
                'Band 1',
                'Location 1',
                'OPEN',
                new Date(),
                new Date()
            );

            const jobRole2 = new JobRole(
                2,
                'Role 2',
                'Desc2',
                'Resp2',
                'URL2',
                2,
                new Date('2026-11-30'),
                'Capability 2',
                'Band 2',
                'Location 2',
                'CLOSED',
                new Date(),
                new Date()
            );

            const response1 = mapper.toResponse(jobRole1);
            const response2 = mapper.toResponse(jobRole2);

            expect(response1.jobRoleId).toBe(1);
            expect(response1.roleName).toBe('Role 1');
            expect(response2.jobRoleId).toBe(2);
            expect(response2.roleName).toBe('Role 2');
        });

        it('should only include expected response fields', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                'Desc',
                'Resp',
                'URL',
                1,
                new Date('2026-12-31'),
                'Capability',
                'Band',
                'Location',
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            const expectedKeys = ['jobRoleId', 'roleName', 'description', 'responsibilities', 'sharepointUrl', 'numberOfOpenPositions', 'closingDate', 'capabilityName', 'bandName', 'locationName', 'statusName'];
            const actualKeys = Object.keys(response);

            expect(actualKeys.sort()).toEqual(expectedKeys.sort());
        });
    });
});
