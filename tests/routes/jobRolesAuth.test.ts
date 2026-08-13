import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/index.ts';
import type { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';
import { JobRolesService } from '../../src/services/jobRolesService.ts';
import { NotFoundError } from 'error-lib';
import { ConflictError } from '../../src/errors/conflictError.js';

describe('Job role route auth protection', () => {
	let originalJwtSecret: string | undefined;

	beforeEach(() => {
		originalJwtSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = 'test-secret';
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	it('should return 200 without bearer token on list endpoint', async () => {
		vi.spyOn(JobRolesService.prototype, 'findAll').mockResolvedValueOnce([]);

		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(200);
		expect(response.body).toEqual([]);
	});

	it('should return 200 without bearer token on detail endpoint', async () => {
		vi.spyOn(JobRolesService.prototype, 'findById').mockResolvedValueOnce({
			jobRoleId: 1,
			roleName: 'Engineer',
			capabilityName: 'Software',
			bandName: 'Band 1',
			locationName: 'Singapore',
			closingDate: new Date('2026-08-01T00:00:00.000Z'),
			statusName: 'OPEN',
			description: 'Role description',
			responsibilities: 'Role responsibilities',
			sharepointUrl: 'https://example.com/spec',
			numberOfOpenPositions: 2,
			addressLine1: '123 Street',
			addressLine2: 'Unit 1',
			postcode: 'S1 1AA',
		});

		const response = await request(app).get('/job-roles/1');

		expect(response.status).toBe(200);
		expect(response.body.jobRoleId).toBe(1);
		expect(response.body.roleName).toBe('Engineer');
	});

	it('should return 200 with user token on list endpoint', async () => {
		const serviceResponse: JobRoleResponse[] = [
			{
				jobRoleId: 1,
				roleName: 'Engineer',
				capabilityName: 'Software',
				bandName: 'Band 1',
				locationName: 'Singapore',
				closingDate: new Date('2026-08-01T00:00:00.000Z'),
				statusName: 'OPEN',
			},
		];

		const expectedResponse = [
			{
				jobRoleId: 1,
				roleName: 'Engineer',
				capabilityName: 'Software',
				bandName: 'Band 1',
				locationName: 'Singapore',
				closingDate: '2026-08-01T00:00:00.000Z',
				statusName: 'OPEN',
			},
		];

		vi.spyOn(JobRolesService.prototype, 'findAll').mockResolvedValueOnce(serviceResponse);

		const token = jwt.sign(
			{ userId: 1, email: 'test1@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.get('/job-roles')
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual(expectedResponse);
	});

	it('should return 200 with admin token on list endpoint', async () => {
		const expected: JobRoleResponse[] = [];

		vi.spyOn(JobRolesService.prototype, 'findAll').mockResolvedValueOnce(expected);

		const token = jwt.sign(
			{ userId: 2, email: 'admin@example.com', role: 'ADMIN' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.get('/job-roles')
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual(expected);
	});

	it('should return 403 for user token on create endpoint', async () => {
		const token = jwt.sign(
			{ userId: 1, email: 'test1@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const payload = {
			roleName: 'Mock Role',
			description: 'Mock role description',
			responsibilities: 'Mock responsibilities',
			sharepointUrl: 'https://example.com/roles/mock-role',
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 1,
			locationId: 1,
		};

		const response = await request(app)
			.post('/job-roles/create')
			.set('Authorization', `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: 'Forbidden' });
	});

	it('should return 201 for admin token on create endpoint', async () => {
		const token = jwt.sign(
			{ userId: 2, email: 'admin@example.com', role: 'ADMIN' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const payload = {
			roleName: 'Mock Role',
			description: 'Mock role description',
			responsibilities: 'Mock responsibilities',
			sharepointUrl: 'https://example.com/roles/mock-role',
			numberOfOpenPositions: 2,
			capabilityId: 1,
			bandId: 1,
			locationId: 1,
		};
		const createdJobRole: JobRoleResponse = {
			jobRoleId: 1,
			roleName: 'Mock Role',
			capabilityName: 'Software',
			bandName: 'Band 1',
			locationName: 'Birmingham',
			closingDate: null,
			statusName: 'OPEN',
		};

		vi.spyOn(JobRolesService.prototype, 'createJobRole').mockResolvedValueOnce(createdJobRole);

		const response = await request(app)
			.post('/job-roles/create')
			.set('Authorization', `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			...createdJobRole,
			closingDate: null,
		});
	});

	it('should return 400 when create payload is invalid', async () => {
		const token = jwt.sign(
			{ userId: 2, email: 'admin@example.com', role: 'ADMIN' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.post('/job-roles/create')
			.set('Authorization', `Bearer ${token}`)
			.send({ roleName: '' });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.any(Array),
		});
	});
});

describe('POST /job-roles/:id/apply', () => {
	let originalJwtSecret: string | undefined;

	beforeEach(() => {
		originalJwtSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = 'test-secret';
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	it('should return 401 without bearer token', async () => {
		const response = await request(app)
			.post('/job-roles/1/apply')
			.send({ cvText: 'CV-2026-001' });

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid token' });
	});

	it('should return 400 for invalid job role id', async () => {
		const token = jwt.sign(
			{ userId: 1, email: 'user@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.post('/job-roles/abc/apply')
			.set('Authorization', `Bearer ${token}`)
			.send({ cvText: 'CV-2026-001' });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({ field: 'id', message: expect.any(String) }),
			]),
		});
	});

	it('should return 400 when cv text is empty', async () => {
		const token = jwt.sign(
			{ userId: 1, email: 'user@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.post('/job-roles/1/apply')
			.set('Authorization', `Bearer ${token}`)
			.send({ cvText: '' });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: 'cvText',
					message: expect.any(String),
				}),
			]),
		});
	});

	it('should return 201 when user successfully applies for job role', async () => {
		const token = jwt.sign(
			{ userId: 1, email: 'user@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		vi.spyOn(JobRolesService.prototype, 'createApplication').mockResolvedValueOnce({
			applicationId: 1,
			jobRoleId: 1,
			userId: 1,
			cvText: 'CV-2026-001',
		});

		const response = await request(app)
			.post('/job-roles/1/apply')
			.set('Authorization', `Bearer ${token}`)
			.send({ cvText: 'CV-2026-001' });

		expect(response.status).toBe(201);
		expect(response.body).toSatisfy(
			(value) =>
				value.applicationId === 1 &&
				value.jobRoleId === 1 &&
				value.userId === 1 &&
				value.cvText === 'CV-2026-001',
		);
	});

	it('should return 404 when job role does not exist', async () => {
		const token = jwt.sign(
			{ userId: 1, email: 'user@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		vi.spyOn(JobRolesService.prototype, 'createApplication').mockRejectedValueOnce(
			new NotFoundError('JobRole with id 999 not found'),
		);

		const response = await request(app)
			.post('/job-roles/999/apply')
			.set('Authorization', `Bearer ${token}`)
			.send({ cvText: 'CV-2026-001' });

		expect(response.status).toBe(404);
		expect(response.body).toEqual({ error: 'JobRole with id 999 not found' });
	});

	it('should return 409 when user has already applied for the job role', async () => {
		const token = jwt.sign(
			{ userId: 1, email: 'user@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		vi.spyOn(JobRolesService.prototype, 'createApplication').mockRejectedValueOnce(
			new ConflictError(409, 'User with id 1 has already applied for JobRole with id 1'),
		);

		const response = await request(app)
			.post('/job-roles/1/apply')
			.set('Authorization', `Bearer ${token}`)
			.send({ cvText: 'CV-2026-001' });

		expect(response.status).toBe(409);
		expect(response.body).toEqual({
			error: 'User with id 1 has already applied for JobRole with id 1',
		});
	});

	it('should allow admin users to apply for job roles', async () => {
		const token = jwt.sign(
			{ userId: 2, email: 'admin@example.com', role: 'ADMIN' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		vi.spyOn(JobRolesService.prototype, 'createApplication').mockResolvedValueOnce({
			applicationId: 2,
			jobRoleId: 1,
			userId: 2,
			cvText: 'CV-2026-002',
		});

		const response = await request(app)
			.post('/job-roles/1/apply')
			.set('Authorization', `Bearer ${token}`)
			.send({ cvText: 'CV-2026-002' });

		expect(response.status).toBe(201);
		expect(response.body).toSatisfy((value) => value.userId === 2);
	});
});
