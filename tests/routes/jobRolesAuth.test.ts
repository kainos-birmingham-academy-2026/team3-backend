import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/index.ts';
import type { JobRoleResponse } from '../../src/models/jobRoleResponse.ts';
import { JobRolesService } from '../../src/services/jobRolesService.ts';

describe('GET /job-roles auth protection', () => {
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
		const response = await request(app).get('/job-roles');

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid token' });
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
				status: 'OPEN',
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
				status: 'OPEN',
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

		const response = await request(app)
			.post('/job-roles')
			.set('Authorization', `Bearer ${token}`)
			.send({ roleName: 'Mock Role' });

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: 'Forbidden' });
	});

	it('should return 201 for admin token on create endpoint', async () => {
		const token = jwt.sign(
			{ userId: 2, email: 'admin@example.com', role: 'ADMIN' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const payload = { roleName: 'Mock Role' };

		const response = await request(app)
			.post('/job-roles')
			.set('Authorization', `Bearer ${token}`)
			.send(payload);

		expect(response.status).toBe(201);
		expect(response.body).toEqual({
			message: 'Mock create endpoint reached',
			payload,
		});
	});
});
