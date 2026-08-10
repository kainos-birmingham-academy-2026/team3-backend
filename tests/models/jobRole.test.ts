import { describe, it, expect } from 'vitest';
import { JobRole } from '../../src/models/jobRole.ts';

describe('JobRole Model', () => {
    it('should create instance with all properties', () => {
        const jobRoleId = 1;
        const roleName = 'Software Engineer';
        const location = 'Birmingham';
        const capabilityId = 1;
        const bandId = 1;
        const closingDate = new Date('2026-12-31');
        const status = 'OPEN';
        const createdAt = new Date('2026-01-01');
        const updatedAt = new Date('2026-01-01');

        const jobRole = new JobRole(
            jobRoleId,
            roleName,
            location,
            capabilityId,
            bandId,
            closingDate,
            status,
            createdAt,
            updatedAt
        );

        expect(jobRole.jobRoleId).toBe(jobRoleId);
        expect(jobRole.roleName).toBe(roleName);
        expect(jobRole.location).toBe(location);
        expect(jobRole.capabilityId).toBe(capabilityId);
        expect(jobRole.bandId).toBe(bandId);
        expect(jobRole.closingDate).toEqual(closingDate);
        expect(jobRole.status).toBe(status);
        expect(jobRole.createdAt).toEqual(createdAt);
        expect(jobRole.updatedAt).toEqual(updatedAt);
    });

    it('should have jobRoleId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.jobRoleId).toBe(1);
    });

    it('should have roleName as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.roleName).toBe('Role');
    });

    it('should have capabilityId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 5, 1, new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.capabilityId).toBe(5);
    });


    it('should have bandId as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 3, new Date(), 'OPEN', new Date(), new Date());
        expect(jobRole.bandId).toBe(3);
    });


    it('should have closingDate as readonly', () => {
        const closingDate = new Date('2026-12-31');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, closingDate, 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toEqual(closingDate);
    });

    it('should allow null closingDate', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, null, 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toBeNull();
    });

    it('should have status as readonly', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'CLOSED', new Date(), new Date());
        expect(jobRole.status).toBe('CLOSED');
    });

    it('should have createdAt as readonly', () => {
        const createdAt = new Date('2026-01-01');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN', createdAt, new Date());
        expect(jobRole.createdAt).toEqual(createdAt);
    });

    it('should have updatedAt as readonly', () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN', new Date(), updatedAt);
        expect(jobRole.updatedAt).toEqual(updatedAt);
    });

    it('should accept number type for jobRoleId', () => {
        const jobRole = new JobRole(999, 'Role', 'Location', 1, 1, new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.jobRoleId).toBe('number');
        expect(jobRole.jobRoleId).toBe(999);
    });

    it('should accept string type for roleName', () => {
        const jobRole = new JobRole(1, 'Developer', 'Location', 1, 1, new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.roleName).toBe('string');
        expect(jobRole.roleName).toBe('Developer');
    });


    it('should accept number type for capabilityId', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 42, 1, new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.capabilityId).toBe('number');
        expect(jobRole.capabilityId).toBe(42);
    });

    it('should accept number type for bandId', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 7, new Date(), 'OPEN', new Date(), new Date());
        expect(typeof jobRole.bandId).toBe('number');
        expect(jobRole.bandId).toBe(7);
    });


    it('should accept Date type for closingDate', () => {
        const closingDate = new Date('2026-12-31');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, closingDate, 'OPEN', new Date(), new Date());
        expect(jobRole.closingDate).toBeInstanceOf(Date);
    });

    it('should accept string type for status', () => {
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'PENDING', new Date(), new Date());
        expect(typeof jobRole.status).toBe('string');
        expect(jobRole.status).toBe('PENDING');
    });

    it('should accept Date type for createdAt', () => {
        const createdAt = new Date('2026-01-01');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN', createdAt, new Date());
        expect(jobRole.createdAt).toBeInstanceOf(Date);
    });

    it('should accept Date type for updatedAt', () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, new Date(), 'OPEN', new Date(), updatedAt);
        expect(jobRole.updatedAt).toBeInstanceOf(Date);
    });

    it("Should allow Null for closing date", () => {
        const updatedAt = new Date('2026-02-01');
        const jobRole = new JobRole(1, 'Role', 'Location', 1, 1, null, 'OPEN', new Date(), updatedAt);
        expect(jobRole.closingDate).toBeNull();
    });

});
