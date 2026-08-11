import { describe, it, expect } from 'vitest';
import { JobRole } from '../../src/models/jobRole.ts';

describe('JobRole Model', () => {
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
        const createdAt = new Date('2026-01-01');
        const updatedAt = new Date('2026-01-01');

        const jobRole = new JobRole(
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
            statusName,
            createdAt,
            updatedAt
        );

        expect(jobRole.jobRoleId).toBe(jobRoleId);
        expect(jobRole.roleName).toBe(roleName);
        expect(jobRole.description).toBe(description);
        expect(jobRole.responsibilities).toBe(responsibilities);
        expect(jobRole.sharepointUrl).toBe(sharepointUrl);
        expect(jobRole.numberOfOpenPositions).toBe(numberOfOpenPositions);
        expect(jobRole.closingDate).toEqual(closingDate);
        expect(jobRole.capabilityName).toBe(capabilityName);
        expect(jobRole.bandName).toBe(bandName);
        expect(jobRole.locationName).toBe(locationName);
        expect(jobRole.statusName).toBe(statusName);
        expect(jobRole.createdAt).toEqual(createdAt);
        expect(jobRole.updatedAt).toEqual(updatedAt);
    });

    it('should have jobRoleId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.jobRoleId).toBe(1);
    });

    it('should have roleName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.roleName).toBe('Role');
    });

    it('should have description as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Test Description', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.description).toBe('Test Description');
    });

    it('should have responsibilities as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Test Responsibilities', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.responsibilities).toBe('Test Responsibilities');
    });

    it('should have sharepointUrl as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'https://test.url', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.sharepointUrl).toBe('https://test.url');
    });

    it('should have numberOfOpenPositions as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 5, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.numberOfOpenPositions).toBe(5);
    });

    it('should have locationName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.locationName).toBe('Location');
    });

    it('should have capabilityName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Data & AI', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.capabilityName).toBe('Data & AI');
    });

    it('should have bandName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Senior Engineer', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.bandName).toBe('Senior Engineer');
    });

    it('should have closingDate as readonly', () => {
        const closingDate = new Date('2026-12-31');
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, closingDate, 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toEqual(closingDate);
    });

    it('should allow null closingDate', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, null, 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toBeNull();
    });

    it('should have statusName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'CLOSED', new Date(), new Date());
        expect(jobRole.statusName).toBe('CLOSED');
    });

    it('should have createdAt as readonly', () => {
        const createdAt = new Date('2026-01-01');
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', createdAt, new Date());
        expect(jobRole.createdAt).toEqual(createdAt);
    });

    it('should have updatedAt as readonly', () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), updatedAt);
        expect(jobRole.updatedAt).toEqual(updatedAt);
    });

    it('should accept number type for jobRoleId', () => {
        const jobRole = new JobRole(999, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.jobRoleId).toBe('number');
        expect(jobRole.jobRoleId).toBe(999);
    });

    it('should accept string type for roleName', () => {
        const jobRole = new JobRole(1, 'Developer', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.roleName).toBe('string');
        expect(jobRole.roleName).toBe('Developer');
    });

    it('should accept string type for description', () => {
        const jobRole = new JobRole(1, 'Role', 'Comprehensive description', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.description).toBe('string');
        expect(jobRole.description).toBe('Comprehensive description');
    });

    it('should accept string type for responsibilities', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Lead team, manage projects', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.responsibilities).toBe('string');
        expect(jobRole.responsibilities).toBe('Lead team, manage projects');
    });

    it('should accept string type for sharepointUrl', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'https://sharepoint.com/role', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.sharepointUrl).toBe('string');
        expect(jobRole.sharepointUrl).toBe('https://sharepoint.com/role');
    });

    it('should accept number type for numberOfOpenPositions', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 10, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.numberOfOpenPositions).toBe('number');
        expect(jobRole.numberOfOpenPositions).toBe(10);
    });

    it('should accept string type for locationName', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Manchester', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.locationName).toBe('string');
        expect(jobRole.locationName).toBe('Manchester');
    });

    it('should accept string type for capabilityName', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Cloud & Infrastructure', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.capabilityName).toBe('string');
        expect(jobRole.capabilityName).toBe('Cloud & Infrastructure');
    });

    it('should accept string type for bandName', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Lead Engineer', 'Location', 'OPEN', new Date(), new Date());
        expect(typeof jobRole.bandName).toBe('string');
        expect(jobRole.bandName).toBe('Lead Engineer');
    });

    it('should accept Date type for closingDate', () => {
        const closingDate = new Date('2026-12-31');
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, closingDate, 'Capability', 'Band', 'Location', 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toBeInstanceOf(Date);
    });

    it('should accept string type for statusName', () => {
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'PENDING', new Date(), new Date());
        expect(typeof jobRole.statusName).toBe('string');
        expect(jobRole.statusName).toBe('PENDING');
    });

    it('should accept Date type for createdAt', () => {
        const createdAt = new Date('2026-01-01');
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', createdAt, new Date());
        expect(jobRole.createdAt).toBeInstanceOf(Date);
    });

    it('should accept Date type for updatedAt', () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 'Desc', 'Resp', 'URL', 1, new Date(), 'Capability', 'Band', 'Location', 'OPEN', new Date(), updatedAt);
        expect(jobRole.updatedAt).toBeInstanceOf(Date);
    });
});
