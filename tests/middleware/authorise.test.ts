import express from 'express';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { allowRoles, USER_ROLES } from '../../src/middleware/authorise.ts';
import { requireAuth } from '../../src/middleware/requireAuth.ts';

describe('allowRoles middleware', () => {
	let originalJwtSecret: string | undefined;

	beforeEach(() => {
		originalJwtSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = 'test-secret';
	});

	afterEach(() => {
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	it('should return 403 when user accesses admin-only endpoint', async () => {
		const app = express();

		app.get(
			'/admin-only',
			requireAuth,
			allowRoles([USER_ROLES.ADMIN]),
			(_req, res) => {
				res.status(200).json({ ok: true });
			},
		);

		const userToken = jwt.sign(
			{ userId: 1, email: 'user@example.com', role: 'USER' },
			process.env.JWT_SECRET as string,
			{ expiresIn: '1h' },
		);

		const response = await request(app)
			.get('/admin-only')
			.set('Authorization', `Bearer ${userToken}`);

		expect(response.status).toBe(403);
		expect(response.body).toEqual({ message: 'Forbidden' });
	});

	it('should return 401 when auth user is missing', async () => {
		const app = express();

		app.get('/admin-only', allowRoles([USER_ROLES.ADMIN]), (_req, res) => {
			res.status(200).json({ ok: true });
		});

		const response = await request(app).get('/admin-only');

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid token' });
	});

	it('should return 401 when auth user role is missing', async () => {
		const app = express();

		app.get(
			'/admin-only',
			(_req, res, next) => {
				res.locals.authUser = {};
				next();
			},
			allowRoles([USER_ROLES.ADMIN]),
			(_req, res) => {
				res.status(200).json({ ok: true });
			},
		);

		const response = await request(app).get('/admin-only');

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid token' });
	});
});
