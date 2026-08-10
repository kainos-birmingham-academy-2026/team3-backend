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
                3,
                'Birmingham',
                1,
                'Software Engineering',
                1,
                'Engineer',
                new Date('2026-12-31'),
                'OPEN',
                new Date('2026-01-01'),
                new Date('2026-01-01')
            );

            const response = mapper.toResponse(jobRole);

            expect(response).toBeDefined();
            expect(response.jobRoleId).toBe(1);
            expect(response.roleName).toBe('Software Engineer');
            expect(response.locationName).toBe('Birmingham');
            expect(response.capabilityName).toBe('Software Engineering');
            expect(response.bandName).toBe('Engineer');
            expect(response.status).toBe('OPEN');
        });

        it('should map jobRoleId field correctly', () => {
            const jobRole = new JobRole(
                42,
                'Role',
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
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
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.roleName).toBe('Senior Developer');
        });

        it('should map locationName field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                7,
                'Manchester',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
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
                1,
                'Location',
                5,
                'Data & AI',
                1,
                'Band',
                new Date('2026-12-31'),
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
                1,
                'Location',
                1,
                'Capability',
                3,
                'Senior Engineer',
                new Date('2026-12-31'),
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
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                closingDate,
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.closingDate).toEqual(closingDate);
        });

        it('should map status field correctly', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
                'CLOSED',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            expect(response.status).toBe('CLOSED');
        });

        it('should exclude createdAt from response', () => {
            const jobRole = new JobRole(
                1,
                'Role',
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
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
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
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
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                closingDate,
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
                1,
                'Location 1',
                1,
                'Capability 1',
                1,
                'Band 1',
                new Date('2026-12-31'),
                'OPEN',
                new Date(),
                new Date()
            );

            const jobRole2 = new JobRole(
                2,
                'Role 2',
                2,
                'Location 2',
                2,
                'Capability 2',
                2,
                'Band 2',
                new Date('2026-11-30'),
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
                1,
                'Location',
                1,
                'Capability',
                1,
                'Band',
                new Date('2026-12-31'),
                'OPEN',
                new Date(),
                new Date()
            );

            const response = mapper.toResponse(jobRole);

            const expectedKeys = ['jobRoleId', 'roleName', 'locationName', 'capabilityName', 'bandName', 'closingDate', 'status'];
            const actualKeys = Object.keys(response);

            expect(actualKeys.sort()).toEqual(expectedKeys.sort());
        });
    });
});
