import { describe, it, expect } from 'vitest';
import { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';

describe('JobRoleResponse Model', () => {
    it('should create instance with all properties', () => {
        const jobRoleId = 1;
        const roleName = 'Software Engineer';
        const description = 'Build and maintain software systems';
        const responsibilities = 'Code development, testing, deployment';
        const sharepointUrl = 'https://sharepoint.example.com/roles/1';
        const numberOfOpenPositions = 2;
        const closingDate = new Date('2026-12-31');
        const capabilityName = 'Software Engineering';
        const bandName = 'Engineer';
        const locationName = 'Birmingham';
        const statusName = 'OPEN';

        const response = new JobRoleResponse(
            jobRoleId,
            roleName,
            description,
            responsibilities,
            sharepointUrl,
            numberOfOpenPositions,
            closingDate,
            capabilityName,
            bandName,
            locationName,
            statusName
        );

        expect(response.jobRoleId).toBe(jobRoleId);
        expect(response.roleName).toBe(roleName);
        expect(response.description).toBe(description);
        expect(response.responsibilities).toBe(responsibilities);
        expect(response.sharepointUrl).toBe(sharepointUrl);
        expect(response.numberOfOpenPositions).toBe(numberOfOpenPositions);
        expect(response.closingDate).toEqual(closingDate);
        expect(response.capabilityName).toBe(capabilityName);
        expect(response.bandName).toBe(bandName);
        expect(response.locationName).toBe(locationName);
        expect(response.statusName).toBe(statusName);
    });

    it('should have jobRoleId as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.jobRoleId).toBe(1);
    });

    it('should have roleName as readonly', () => {
        const response = new JobRoleResponse(1, 'Developer', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.roleName).toBe('Developer');
    });

    it('should have description as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Test Description', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.description).toBe('Test Description');
    });

    it('should have responsibilities as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Test Responsibilities', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.responsibilities).toBe('Test Responsibilities');
    });

    it('should have sharepointUrl as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'https://test.url', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.sharepointUrl).toBe('https://test.url');
    });

    it('should have numberOfOpenPositions as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 5, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.numberOfOpenPositions).toBe(5);
    });

    it('should have locationName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'London', 'OPEN');
        expect(response.locationName).toBe('London');
    });

    it('should have capabilityName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Data & AI', 'Band', 'Location', 'OPEN');
        expect(response.capabilityName).toBe('Data & AI');
    });

    it('should have bandName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Senior Engineer', 'Location', 'OPEN');
        expect(response.bandName).toBe('Senior Engineer');
    });

    it('should have closingDate as readonly', () => {
        const closingDate = new Date('2026-12-31');
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, closingDate, 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.closingDate).toEqual(closingDate);
    });

    it('should have statusName as readonly', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'CLOSED');
        expect(response.statusName).toBe('CLOSED');
    });

    it('should accept number type for jobRoleId', () => {
        const response = new JobRoleResponse(999, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(typeof response.jobRoleId).toBe('number');
        expect(response.jobRoleId).toBe(999);
    });

    it('should accept string type for roleName', () => {
        const response = new JobRoleResponse(1, 'Senior Developer', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(typeof response.roleName).toBe('string');
        expect(response.roleName).toBe('Senior Developer');
    });

    it('should accept string type for description', () => {
        const response = new JobRoleResponse(1, 'Role', 'Comprehensive description', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(typeof response.description).toBe('string');
        expect(response.description).toBe('Comprehensive description');
    });

    it('should accept string type for responsibilities', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Lead team, manage projects', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(typeof response.responsibilities).toBe('string');
        expect(response.responsibilities).toBe('Lead team, manage projects');
    });

    it('should accept string type for sharepointUrl', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'https://sharepoint.com/role', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(typeof response.sharepointUrl).toBe('string');
        expect(response.sharepointUrl).toBe('https://sharepoint.com/role');
    });

    it('should accept number type for numberOfOpenPositions', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 10, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        expect(typeof response.numberOfOpenPositions).toBe('number');
        expect(response.numberOfOpenPositions).toBe(10);
    });

    it('should accept string type for locationName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Manchester', 'OPEN');
        expect(typeof response.locationName).toBe('string');
        expect(response.locationName).toBe('Manchester');
    });

    it('should accept string type for capabilityName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Cloud & Infrastructure', 'Band', 'Location', 'OPEN');
        expect(typeof response.capabilityName).toBe('string');
        expect(response.capabilityName).toBe('Cloud & Infrastructure');
    });

    it('should accept string type for bandName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Lead Engineer', 'Location', 'OPEN');
        expect(typeof response.bandName).toBe('string');
        expect(response.bandName).toBe('Lead Engineer');
    });

    it('should accept Date type for closingDate', () => {
        const closingDate = new Date('2026-12-31');
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, closingDate, 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.closingDate).toBeInstanceOf(Date);
    });

    it('should accept string type for statusName', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'PENDING');
        expect(typeof response.statusName).toBe('string');
        expect(response.statusName).toBe('PENDING');
    });

    it('should have all 11 fields', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        const keys = Object.keys(response);
        
        expect(keys).toContain('jobRoleId');
        expect(keys).toContain('roleName');
        expect(keys).toContain('description');
        expect(keys).toContain('responsibilities');
        expect(keys).toContain('sharepointUrl');
        expect(keys).toContain('numberOfOpenPositions');
        expect(keys).toContain('closingDate');
        expect(keys).toContain('capabilityName');
        expect(keys).toContain('bandName');
        expect(keys).toContain('locationName');
        expect(keys).toContain('statusName');
        expect(keys).toHaveLength(11);
    });

    it('should not contain createdAt or updatedAt', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        const keys = Object.keys(response);
        
        expect(keys).not.toContain('createdAt');
        expect(keys).not.toContain('updatedAt');
    });

    it('should correctly handle different statusName values', () => {
        const openResponse = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN');
        const closedResponse = new JobRoleResponse(2, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'CLOSED');

        expect(openResponse.statusName).toBe('OPEN');
        expect(closedResponse.statusName).toBe('CLOSED');
    });

    it('should preserve Date object in closingDate', () => {
        const closingDate = new Date('2026-06-15T10:30:00Z');
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, closingDate, 'Capability', 'Band', 'Location', 'OPEN');
        
        expect(response.closingDate.getTime()).toBe(closingDate.getTime());
    });

    it('should allow null closingDate', () => {
        const response = new JobRoleResponse(1, 'Role', 'Desc', 'Resp', 'URL', 1, null, 'Capability', 'Band', 'Location', 'OPEN');
        expect(response.closingDate).toBeNull();
    });
});
