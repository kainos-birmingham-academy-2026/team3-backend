import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthController } from "../../src/controllers/authController.js";
import { AuthError } from "../../src/errors/authError.js";
import { ConflictError } from "../../src/errors/conflictError.js";
import type { AuthService } from "../../src/services/authService.js";

const createMockResponse = () => {
	const res = {
		status: vi.fn(),
		json: vi.fn(),
		send: vi.fn(),
	};

	res.status.mockReturnValue(res);
	res.json.mockReturnValue(res);
	res.send.mockReturnValue(res);

	return res;
};

describe("AuthController", () => {
	const mockService = {
		login: vi.fn(),
		register: vi.fn(),
	} as unknown as AuthService;

	let controller: AuthController;

	beforeEach(() => {
		vi.resetAllMocks();
		controller = new AuthController(mockService);
	});

	describe("register", () => {
		it("should return 201 when register succeeds", async () => {
			const req = {
				body: {
					email: "new@example.com",
					password: "Password123!",
				},
			};
			const res = createMockResponse();

			vi.mocked(mockService.register).mockResolvedValue(undefined);

			await controller.register(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(201);
			expect(res.json).toHaveBeenCalledWith({ message: "User registered" });
		});

		it("should return 409 when email already exists", async () => {
			const req = {
				body: {
					email: "existing@example.com",
					password: "Password123!",
				},
			};
			const res = createMockResponse();

			vi.mocked(mockService.register).mockRejectedValue(
				new ConflictError(409, "Email already in use"),
			);

			await controller.register(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(409);
			expect(res.json).toHaveBeenCalledWith({
				message: "Email already in use",
			});
		});

		it("should return 500 for unexpected errors", async () => {
			const req = {
				body: {
					email: "user@example.com",
					password: "Password123!",
				},
			};
			const res = createMockResponse();

			vi.mocked(mockService.register).mockRejectedValue(
				new Error("Database error"),
			);

			await controller.register(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
		});
	});

	describe("login", () => {
		it("should return 200 with token when login succeeds", async () => {
			const req = {
				body: {
					email: "user@example.com",
					password: "password123",
				},
			};
			const res = createMockResponse();

			vi.mocked(mockService.login).mockResolvedValue("jwt-token");

			await controller.login(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(200);
			const [payload] = vi.mocked(res.json).mock.calls.at(-1) ?? [];
			expect(payload).toSatisfy((value) => value.token === "jwt-token");
		});

		it("should return 401 when credentials are invalid", async () => {
			const req = {
				body: {
					email: "user@example.com",
					password: "wrong-password",
				},
			};
			const res = createMockResponse();

			vi.mocked(mockService.login).mockRejectedValue(
				new AuthError(401, "Invalid email or password"),
			);

			await controller.login(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(401);
			expect(res.json).toHaveBeenCalledWith({
				message: "Invalid email or password",
			});
		});

		it("should return 500 for unexpected errors", async () => {
			const req = {
				body: {
					email: "user@example.com",
					password: "password123",
				},
			};
			const res = createMockResponse();

			vi.mocked(mockService.login).mockRejectedValue(
				new Error("Database error"),
			);

			await controller.login(req as never, res as never);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
		});
	});
});
