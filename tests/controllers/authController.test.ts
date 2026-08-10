import type { Request, Response } from 'express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Mock } from 'vitest';
import { AuthController } from '../../src/controllers/authController.ts';
import { AuthError } from '../../src/services/authService.ts';
import type { AuthService } from '../../src/services/authService.ts';

describe('AuthController', () => {
	let controller: AuthController;
	let mockLogin: Mock;
	let mockService: AuthService;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let statusSpy: Mock;
	let jsonSpy: Mock;

	beforeEach(() => {
		statusSpy = vi.fn().mockReturnThis();
		jsonSpy = vi.fn().mockReturnThis();
		mockLogin = vi.fn();

		mockService = {
			login: mockLogin,
		} as unknown as AuthService;

		mockRequest = {
			body: {
				email: 'user@example.com',
				password: 'password123',
			},
		};

		mockResponse = {
			status: statusSpy as any,
			json: jsonSpy as any,
		};

		controller = new AuthController(mockService);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should return 200 with token when login succeeds', async () => {
		mockLogin.mockResolvedValueOnce('jwt-token');

		await controller.login(mockRequest as Request, mockResponse as Response);

		expect(mockLogin).toHaveBeenCalledWith(mockRequest.body);
		expect(statusSpy).toHaveBeenCalledWith(200);
		expect(jsonSpy).toHaveBeenCalledWith({ token: 'jwt-token' });
	});

	it('should return auth error status and message for AuthError', async () => {
		mockLogin.mockRejectedValueOnce(
			new AuthError(401, 'Invalid email or password'),
		);

		await controller.login(mockRequest as Request, mockResponse as Response);

		expect(statusSpy).toHaveBeenCalledWith(401);
		expect(jsonSpy).toHaveBeenCalledWith({
			message: 'Invalid email or password',
		});
	});

	it('should return 500 for unexpected errors', async () => {
		mockLogin.mockRejectedValueOnce(new Error('Unexpected failure'));

		await controller.login(mockRequest as Request, mockResponse as Response);

		expect(statusSpy).toHaveBeenCalledWith(500);
		expect(jsonSpy).toHaveBeenCalledWith({
			error: 'Internal server error',
		});
	});
});
