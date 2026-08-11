import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { mockFindUnique, mockCreate, mockHash, mockVerify, mockSign } = vi.hoisted(() => {
	return {
		mockFindUnique: vi.fn(),
		mockCreate: vi.fn(),
		mockHash: vi.fn(),
		mockVerify: vi.fn(),
		mockSign: vi.fn(),
	};
});

vi.mock('../../src/prismaClient.ts', () => {
	return {
		default: {
			user: {
				findUnique: mockFindUnique,
				create: mockCreate,
			},
		},
	};
});

vi.mock('argon2', () => {
	return {
		default: {
			hash: mockHash,
			verify: mockVerify,
		},
	};
});

vi.mock('jsonwebtoken', () => {
	return {
		default: {
			sign: mockSign,
		},
	};
});

import { AuthError, AuthService } from '../../src/services/authService.ts';

describe('AuthService', () => {
	let service: AuthService;
	let originalJwtSecret: string | undefined;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new AuthService();
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

	it('should return token for valid credentials', async () => {
		mockFindUnique.mockResolvedValueOnce({
			id: 12,
			email: 'user@example.com',
			passwordHash: 'stored-hash',
			role: 'RECRUITMENT_ADMIN',
		});
		mockVerify.mockResolvedValueOnce(true);
		mockSign.mockReturnValueOnce('signed-jwt-token');

		const result = await service.login({
			email: 'user@example.com',
			password: 'password123',
		});

		expect(result).toBe('signed-jwt-token');
		expect(mockFindUnique).toHaveBeenCalledWith({
			where: { email: 'user@example.com' },
		});
		expect(mockVerify).toHaveBeenCalledWith('stored-hash', 'password123');
		expect(mockSign).toHaveBeenCalledWith(
			{ userId: 12, email: 'user@example.com', role: 'RECRUITMENT_ADMIN' },
			'test-secret',
			{ expiresIn: '1h' },
		);
	});

	it('should register a new applicant user', async () => {
		mockFindUnique.mockResolvedValueOnce(null);
		mockHash.mockResolvedValueOnce('hashed-password');
		mockCreate.mockResolvedValueOnce({});

		await expect(
			service.register({ email: 'new@example.com', password: 'password123' }),
		).resolves.toBeUndefined();

		expect(mockFindUnique).toHaveBeenCalledWith({
			where: { email: 'new@example.com' },
		});
		expect(mockHash).toHaveBeenCalledWith('password123');
		expect(mockCreate).toHaveBeenCalledWith({
			data: {
				email: 'new@example.com',
				passwordHash: 'hashed-password',
				role: 'APPLICANT',
			},
		});
	});

	it('should throw 409 when email is already in use', async () => {
		mockFindUnique.mockResolvedValueOnce({
			id: 20,
			email: 'existing@example.com',
			passwordHash: 'stored-hash',
			role: 'APPLICANT',
		});

		await expect(
			service.register({ email: 'existing@example.com', password: 'password123' }),
		).rejects.toEqual(new AuthError(409, 'Email already in use'));

		expect(mockHash).not.toHaveBeenCalled();
		expect(mockCreate).not.toHaveBeenCalled();
	});

	it('should throw 401 when user does not exist', async () => {
		mockFindUnique.mockResolvedValueOnce(null);

		await expect(
			service.login({ email: 'missing@example.com', password: 'irrelevant' }),
		).rejects.toEqual(new AuthError(401, 'Invalid email or password'));

		expect(mockVerify).not.toHaveBeenCalled();
		expect(mockSign).not.toHaveBeenCalled();
	});

	it('should throw 401 when password is invalid', async () => {
		mockFindUnique.mockResolvedValueOnce({
			id: 99,
			email: 'user@example.com',
			passwordHash: 'stored-hash',
			role: 'APPLICANT',
		});
		mockVerify.mockResolvedValueOnce(false);

		await expect(
			service.login({ email: 'user@example.com', password: 'wrong' }),
		).rejects.toEqual(new AuthError(401, 'Invalid email or password'));

		expect(mockSign).not.toHaveBeenCalled();
	});

	it('should throw when JWT_SECRET is missing', async () => {
		mockFindUnique.mockResolvedValueOnce({
			id: 99,
			email: 'user@example.com',
			passwordHash: 'stored-hash',
			role: 'APPLICANT',
		});
		mockVerify.mockResolvedValueOnce(true);
		delete process.env.JWT_SECRET;

		await expect(
			service.login({ email: 'user@example.com', password: 'password123' }),
		).rejects.toThrow('JWT_SECRET is not configured');

		expect(mockSign).not.toHaveBeenCalled();
	});
});
