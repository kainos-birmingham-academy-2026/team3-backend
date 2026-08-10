import { describe, it, expect } from 'vitest';
import { JobRole } from '../../src/models/jobRole.ts';

describe('JobRole Model', () => {
    it('should create instance with all properties', () => {
        const jobRoleId = 1;
        const roleName = 'Software Engineer';
        const locationId = 3;
        const locationName = 'Birmingham';
        const capabilityId = 1;
        const capabilityName = 'Software Engineering';
        const bandId = 1;
        const bandName = 'Engineer';
        const closingDate = new Date('2026-12-31');
        const status = 'OPEN';
        const createdAt = new Date('2026-01-01');
        const updatedAt = new Date('2026-01-01');

        const jobRole = new JobRole(
            jobRoleId,
            roleName,
            locationId,
            locationName,
            capabilityId,
            capabilityName,
            bandId,
            bandName,
            closingDate,
            status,
            createdAt,
            updatedAt
        );

        expect(jobRole.jobRoleId).toBe(jobRoleId);
        expect(jobRole.roleName).toBe(roleName);
        expect(jobRole.locationId).toBe(locationId);
        expect(jobRole.locationName).toBe(locationName);
        expect(jobRole.capabilityId).toBe(capabilityId);
        expect(jobRole.capabilityName).toBe(capabilityName);
        expect(jobRole.bandId).toBe(bandId);
        expect(jobRole.bandName).toBe(bandName);
        expect(jobRole.closingDate).toEqual(closingDate);
        expect(jobRole.status).toBe(status);
        expect(jobRole.createdAt).toEqual(createdAt);
        expect(jobRole.updatedAt).toEqual(updatedAt);
    });

    it('should have jobRoleId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.jobRoleId).toBe(1);
    });

    it('should have roleName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.roleName).toBe('Role');
    });

    it('should have location fields as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 5, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.locationId).toBe(5);
        expect(jobRole.locationName).toBe('Location');
    });

    it('should have capabilityId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 5, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.capabilityId).toBe(5);
    });

    it('should have capabilityName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Data & AI', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.capabilityName).toBe('Data & AI');
    });

    it('should have bandId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 3, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.bandId).toBe(3);
    });

    it('should have bandName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Senior Engineer', new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.bandName).toBe('Senior Engineer');
    });

    it('should have closingDate as readonly', () => {
        const closingDate = new Date('2026-12-31');
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', closingDate, 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toEqual(closingDate);
    });

    it('should allow null closingDate', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', null, 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toBeNull();
    });

    it('should have status as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'CLOSED', new Date(), new Date());
        expect(jobRole.status).toBe('CLOSED');
    });

    it('should have createdAt as readonly', () => {
        const createdAt = new Date('2026-01-01');
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', createdAt, new Date());
        expect(jobRole.createdAt).toEqual(createdAt);
    });

    it('should have updatedAt as readonly', () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), updatedAt);
        expect(jobRole.updatedAt).toEqual(updatedAt);
    });

    it('should accept number type for jobRoleId', () => {
        const jobRole = new JobRole(999, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.jobRoleId).toBe('number');
        expect(jobRole.jobRoleId).toBe(999);
    });

    it('should accept string type for roleName', () => {
        const jobRole = new JobRole(1, 'Developer', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.roleName).toBe('string');
        expect(jobRole.roleName).toBe('Developer');
    });

    it('should accept location field types', () => {
        const jobRole = new JobRole(1, 'Role', 10, 'London', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.locationId).toBe('number');
        expect(typeof jobRole.locationName).toBe('string');
        expect(jobRole.locationName).toBe('London');
    });

    it('should accept number type for capabilityId', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 42, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.capabilityId).toBe('number');
        expect(jobRole.capabilityId).toBe(42);
    });

    it('should accept string type for capabilityName', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Cloud & Infrastructure', 1, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.capabilityName).toBe('string');
        expect(jobRole.capabilityName).toBe('Cloud & Infrastructure');
    });

    it('should accept number type for bandId', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 7, 'Band', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.bandId).toBe('number');
        expect(jobRole.bandId).toBe(7);
    });

    it('should accept string type for bandName', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Lead Engineer', new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.bandName).toBe('string');
        expect(jobRole.bandName).toBe('Lead Engineer');
    });

    it('should accept Date type for closingDate', () => {
        const closingDate = new Date('2026-12-31');
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', closingDate, 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toBeInstanceOf(Date);
    });

    it('should accept string type for status', () => {
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'PENDING', new Date(), new Date());
        expect(typeof jobRole.status).toBe('string');
        expect(jobRole.status).toBe('PENDING');
    });

    it('should accept Date type for createdAt', () => {
        const createdAt = new Date('2026-01-01');
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', createdAt, new Date());
        expect(jobRole.createdAt).toBeInstanceOf(Date);
    });

    it('should accept Date type for updatedAt', () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 1, 'Location', 1, 'Capability', 1, 'Band', new Date(), 'OPEN', new Date(), updatedAt);
        expect(jobRole.updatedAt).toBeInstanceOf(Date);
    });

    it("Should allow Null for closing date", () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, null, 'OPEN', new Date(), updatedAt);
        expect(jobRole.closingDate).toBeNull();
    });

});
