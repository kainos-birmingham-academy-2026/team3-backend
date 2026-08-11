import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import app from '../../src/index.ts';
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

	it('should return 200 with valid bearer token', async () => {
		const expected = [
			{
				jobRoleId: 1,
				roleName: 'Engineer',
				capability: 'Software',
				band: 'Band 1',
				location: 'Singapore',
				closingDate: null,
				status: 'OPEN',
			},
		];

		vi.spyOn(JobRolesService.prototype, 'findAll').mockResolvedValueOnce(expected);

		const token = jwt.sign(
			{ userId: 1, email: 'test1@example.com' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.get('/job-roles')
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body).toEqual(expected);
	});
});
