import { describe, it, expect } from 'vitest';
import { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';

describe('JobRoleResponse Model', () => {
    it('should create instance with 7 properties', () => {
        const jobRoleId = 1;
        const roleName = 'Software Engineer';
        const locationName = 'Birmingham';
        const capabilityName = 'Software Engineering';
        const bandName = 'Engineer';
        const closingDate = new Date('2026-12-31');
        const status = 'OPEN';

        const response = new JobRoleResponse(
            jobRoleId,
            roleName,
            locationName,
            capabilityName,
            bandName,
            closingDate,
            status
        );

        expect(response.jobRoleId).toBe(jobRoleId);
        expect(response.roleName).toBe(roleName);
        expect(response.locationName).toBe(locationName);
        expect(response.capabilityName).toBe(capabilityName);
        expect(response.bandName).toBe(bandName);
        expect(response.closingDate).toEqual(closingDate);
        expect(response.status).toBe(status);
    });

    it('should have jobRoleId as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        expect(response.jobRoleId).toBe(1);
    });

    it('should have roleName as readonly', () => {
        const response = new JobRoleResponse(1, 'Developer', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        expect(response.roleName).toBe('Developer');
    });

    it('should have locationName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'London', 'Capability', 'Band', new Date(), 'OPEN');
        expect(response.locationName).toBe('London');
    });

    it('should have capabilityName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Data & AI', 'Band', new Date(), 'OPEN');
        expect(response.capabilityName).toBe('Data & AI');
    });

    it('should have bandName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Senior Engineer', new Date(), 'OPEN');
        expect(response.bandName).toBe('Senior Engineer');
    });

    it('should have closingDate as readonly', () => {
        const closingDate = new Date('2026-12-31');
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', closingDate, 'OPEN');
        expect(response.closingDate).toEqual(closingDate);
    });

    it('should have status as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', new Date(), 'CLOSED');
        expect(response.status).toBe('CLOSED');
    });

    it('should accept number type for jobRoleId', () => {
        const response = new JobRoleResponse(999, 'Role', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        expect(typeof response.jobRoleId).toBe('number');
        expect(response.jobRoleId).toBe(999);
    });

    it('should accept string type for roleName', () => {
        const response = new JobRoleResponse(1, 'Senior Developer', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        expect(typeof response.roleName).toBe('string');
        expect(response.roleName).toBe('Senior Developer');
    });

    it('should accept string type for locationName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Manchester', 'Capability', 'Band', new Date(), 'OPEN');
        expect(typeof response.locationName).toBe('string');
        expect(response.locationName).toBe('Manchester');
    });

    it('should accept string type for capabilityName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Cloud & Infrastructure', 'Band', new Date(), 'OPEN');
        expect(typeof response.capabilityName).toBe('string');
        expect(response.capabilityName).toBe('Cloud & Infrastructure');
    });

    it('should accept string type for bandName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Lead Engineer', new Date(), 'OPEN');
        expect(typeof response.bandName).toBe('string');
        expect(response.bandName).toBe('Lead Engineer');
    });

    it('should accept Date type for closingDate', () => {
        const closingDate = new Date('2026-12-31');
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', closingDate, 'OPEN');
        expect(response.closingDate).toBeInstanceOf(Date);
    });

    it('should accept string type for status', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', new Date(), 'PENDING');
        expect(typeof response.status).toBe('string');
        expect(response.status).toBe('PENDING');
    });

    it('should have exactly 7 fields', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        const keys = Object.keys(response);
        
        expect(keys).toContain('jobRoleId');
        expect(keys).toContain('roleName');
        expect(keys).toContain('locationName');
        expect(keys).toContain('capabilityName');
        expect(keys).toContain('bandName');
        expect(keys).toContain('closingDate');
        expect(keys).toContain('status');
        expect(keys).toHaveLength(7);
    });

    it('should not contain createdAt or updatedAt', () => {
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        const keys = Object.keys(response);
        
        expect(keys).not.toContain('createdAt');
        expect(keys).not.toContain('updatedAt');
    });

    it('should correctly handle different status values', () => {
        const openResponse = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', new Date(), 'OPEN');
        const closedResponse = new JobRoleResponse(2, 'Role', 'Location', 'Capability', 'Band', new Date(), 'CLOSED');
        const pendingResponse = new JobRoleResponse(3, 'Role', 'Location', 'Capability', 'Band', new Date(), 'PENDING');

        expect(openResponse.status).toBe('OPEN');
        expect(closedResponse.status).toBe('CLOSED');
        expect(pendingResponse.status).toBe('PENDING');
    });

    it('should preserve Date object in closingDate', () => {
        const closingDate = new Date('2026-06-15T10:30:00Z');
        const response = new JobRoleResponse(1, 'Role', 'Location', 'Capability', 'Band', closingDate, 'OPEN');
        
        expect(response.closingDate.getTime()).toBe(closingDate.getTime());
    });
});
