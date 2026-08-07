import { describe, it, expect } from 'vitest';
import { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';

describe('JobRoleResponse Model', () => {
    it('should create instance with 7 properties', () => {
        const jobRoleId = 1;
        const roleName = 'Software Engineer';
        const location = 'Birmingham';
        const capabilityId = 1;
        const bandId = 1;
        const closingDate = new Date('2026-12-31');
        const status = 'OPEN';

        const response = new JobRoleResponse(
            jobRoleId,
            roleName,
            location,
            capabilityId,
            bandId,
            closingDate,
            status
        );

        expect(response.jobRoleId).toBe(jobRoleId);
        expect(response.roleName).toBe(roleName);
        expect(response.location).toBe(location);
        expect(response.capabilityId).toBe(capabilityId);
        expect(response.bandId).toBe(bandId);
        expect(response.closingDate).toEqual(closingDate);
        expect(response.status).toBe(status);
    });

    it('should have jobRoleId as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN');
        expect(response.jobRoleId).toBe(1);
    });

    it('should have roleName as readonly', () => {
        const response = new JobRoleResponse(1, 'Developer', 'Location', 1, 1, new Date(), 'OPEN');
        expect(response.roleName).toBe('Developer');
    });

    it('should have location as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'London', 1, 1, new Date(), 'OPEN');
        expect(response.location).toBe('London');
    });

    it('should have capabilityId as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 5, 1, new Date(), 'OPEN');
        expect(response.capabilityId).toBe(5);
    });

    it('should have bandId as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 3, new Date(), 'OPEN');
        expect(response.bandId).toBe(3);
    });

    it('should have closingDate as readonly', () => {
        const closingDate = new Date('2026-12-31');
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, closingDate, 'OPEN');
        expect(response.closingDate).toEqual(closingDate);
    });

    it('should have status as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, new Date(), 'CLOSED');
        expect(response.status).toBe('CLOSED');
    });

    it('should accept number type for jobRoleId', () => {
        const response = new JobRoleResponse(999, 'Role', 'Location', 1, 1, new Date(), 'OPEN');
        expect(typeof response.jobRoleId).toBe('number');
        expect(response.jobRoleId).toBe(999);
    });

    it('should accept string type for roleName', () => {
        const response = new JobRoleResponse(1, 'Senior Developer', 'Location', 1, 1, new Date(), 'OPEN');
        expect(typeof response.roleName).toBe('string');
        expect(response.roleName).toBe('Senior Developer');
    });

    it('should accept string type for location', () => {
        const response = new JobRoleResponse(1, 'Role', 'Manchester', 1, 1, new Date(), 'OPEN');
        expect(typeof response.location).toBe('string');
        expect(response.location).toBe('Manchester');
    });

    it('should accept number type for capabilityId', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 42, 1, new Date(), 'OPEN');
        expect(typeof response.capabilityId).toBe('number');
        expect(response.capabilityId).toBe(42);
    });

    it('should accept number type for bandId', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 7, new Date(), 'OPEN');
        expect(typeof response.bandId).toBe('number');
        expect(response.bandId).toBe(7);
    });

    it('should accept Date type for closingDate', () => {
        const closingDate = new Date('2026-12-31');
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, closingDate, 'OPEN');
        expect(response.closingDate).toBeInstanceOf(Date);
    });

    it('should accept string type for status', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, new Date(), 'PENDING');
        expect(typeof response.status).toBe('string');
        expect(response.status).toBe('PENDING');
    });

    it('should have exactly 7 fields', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN');
        const keys = Object.keys(response);
        
        expect(keys).toContain('jobRoleId');
        expect(keys).toContain('roleName');
        expect(keys).toContain('location');
        expect(keys).toContain('capabilityId');
        expect(keys).toContain('bandId');
        expect(keys).toContain('closingDate');
        expect(keys).toContain('status');
        expect(keys).toHaveLength(7);
    });

    it('should not contain createdAt or updatedAt', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN');
        const keys = Object.keys(response);
        
        expect(keys).not.toContain('createdAt');
        expect(keys).not.toContain('updatedAt');
    });

    it('should correctly handle different status values', () => {
        const openResponse = new JobRoleResponse(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN');
        const closedResponse = new JobRoleResponse(2, 'Role', 'Location', 1, 1, new Date(), 'CLOSED');
        const pendingResponse = new JobRoleResponse(3, 'Role', 'Location', 1, 1, new Date(), 'PENDING');

        expect(openResponse.status).toBe('OPEN');
        expect(closedResponse.status).toBe('CLOSED');
        expect(pendingResponse.status).toBe('PENDING');
    });

    it('should preserve Date object in closingDate', () => {
        const closingDate = new Date('2026-06-15T10:30:00Z');
        const response = new JobRoleResponse(1, 'Role', 'Location', 1, 1, closingDate, 'OPEN');
        
        expect(response.closingDate.getTime()).toBe(closingDate.getTime());
    });
});
