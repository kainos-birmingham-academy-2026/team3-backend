import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/index.ts';
import { AuthError, AuthService } from '../../src/services/authService.ts';

describe('POST /api/register', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should return 400 for invalid email format', async () => {
		const response = await request(app).post('/api/register').send({
			email: 'not-an-email',
			password: 'Password123!',
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({ field: 'email', message: expect.any(String) }),
			]),
		});
	});

	it('should return 400 for weak registration password', async () => {
		const response = await request(app).post('/api/register').send({
			email: 'new@example.com',
			password: 'password123',
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({ field: 'password', message: expect.any(String) }),
			]),
		});
	});

	it('should return 201 when registration succeeds', async () => {
		vi.spyOn(AuthService.prototype, 'register').mockResolvedValueOnce(undefined);

		const response = await request(app).post('/api/register').send({
			email: 'new@example.com',
			password: 'Password123!',
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ message: 'User registered' });
	});

	it('should return 409 when email already exists', async () => {
		vi.spyOn(AuthService.prototype, 'register').mockRejectedValueOnce(
			new AuthError(409, 'Email already in use'),
		);

		const response = await request(app).post('/api/register').send({
			email: 'existing@example.com',
			password: 'Password123!',
		});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({ message: 'Email already in use' });
	});
});

describe('POST /api/login', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('should return 400 for invalid email format', async () => {
		const response = await request(app).post('/api/login').send({
			email: 'not-an-email',
			password: 'password123',
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({ field: 'email', message: expect.any(String) }),
			]),
		});
	});

	it('should return 400 when password is missing', async () => {
		const response = await request(app).post('/api/login').send({
			email: 'user@example.com',
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({ field: 'password', message: expect.any(String) }),
			]),
		});
	});

	it('should return 401 when service rejects with auth error', async () => {
		vi.spyOn(AuthService.prototype, 'login').mockRejectedValueOnce(
			new AuthError(401, 'Invalid email or password'),
		);

		const response = await request(app).post('/api/login').send({
			email: 'user@example.com',
			password: 'wrong-password',
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: 'Invalid email or password' });
	});

	it('should return token for valid credentials', async () => {
		vi.spyOn(AuthService.prototype, 'login').mockResolvedValueOnce('mock-jwt-token');

		const response = await request(app).post('/api/login').send({
			email: 'user@example.com',
			password: 'password123',
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ token: 'mock-jwt-token' });
	});
});
