import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError } from "../../src/errors/authError.ts";
import { ConflictError } from "../../src/errors/conflictError.ts";
import { AuthService } from "../../src/services/authService.ts";

const { mockFindUnique, mockCreate, mockHash, mockVerify, mockSign } =
	vi.hoisted(() => {
		return {
			mockFindUnique: vi.fn(),
			mockCreate: vi.fn(),
			mockHash: vi.fn(),
			mockVerify: vi.fn(),
			mockSign: vi.fn(),
		};
	});

vi.mock("../../src/prismaClient.ts", () => {
	return {
		default: {
			user: {
				findUnique: mockFindUnique,
				create: mockCreate,
			},
		},
	};
});

vi.mock("argon2", () => {
	return {
		default: {
			argon2id: "argon2id",
			hash: mockHash,
			verify: mockVerify,
		},
	};
});

vi.mock("jsonwebtoken", () => {
	return {
		default: {
			sign: mockSign,
		},
	};
});

describe("AuthService", () => {
	let service: AuthService;
	let originalJwtSecret: string | undefined;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new AuthService();
		originalJwtSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "test-secret";
	});

	afterEach(() => {
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	describe("login", () => {
		it("should return token for valid credentials", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 12,
				email: "user@example.com",
				passwordHash: "stored-hash",
				role: "ADMIN",
			});
			mockVerify.mockResolvedValueOnce(true);
			mockSign.mockReturnValueOnce("signed-jwt-token");

			const result = await service.login({
				email: "user@example.com",
				password: "password123",
			});

			expect(result).toBe("signed-jwt-token");
			expect(mockFindUnique).toHaveBeenCalledWith({
				where: { email: "user@example.com" },
			});
			expect(mockVerify).toHaveBeenCalledWith("stored-hash", "password123");
			expect(mockSign).toHaveBeenCalledWith(
				{ userId: 12, email: "user@example.com", role: "ADMIN" },
				"test-secret",
				{ expiresIn: "1h" },
			);
		});

		it("should throw 401 when user does not exist", async () => {
			mockFindUnique.mockResolvedValueOnce(null);

			await expect(
				service.login({ email: "missing@example.com", password: "irrelevant" }),
			).rejects.toThrow("Invalid email or password");

			expect(mockVerify).not.toHaveBeenCalled();
			expect(mockSign).not.toHaveBeenCalled();
		});

		it("should throw 401 when password is invalid", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 99,
				email: "user@example.com",
				passwordHash: "stored-hash",
				role: "USER",
			});
			mockVerify.mockResolvedValueOnce(false);

			await expect(
				service.login({ email: "user@example.com", password: "wrong" }),
			).rejects.toThrow("Invalid email or password");

			expect(mockSign).not.toHaveBeenCalled();
		});

		it("should throw when JWT_SECRET is missing", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 99,
				email: "user@example.com",
				passwordHash: "stored-hash",
				role: "USER",
			});
			mockVerify.mockResolvedValueOnce(true);
			delete process.env.JWT_SECRET;

			await expect(
				service.login({ email: "user@example.com", password: "password123" }),
			).rejects.toThrow("JWT_SECRET is not configured");

			expect(mockSign).not.toHaveBeenCalled();
		});
	});

	describe("register", () => {
		it("should register a new user with USER role", async () => {
			mockFindUnique.mockResolvedValueOnce(null);
			mockHash.mockResolvedValueOnce("hashed-password");
			mockCreate.mockResolvedValueOnce({});

			await expect(
				service.register({ email: "new@example.com", password: "password123" }),
			).resolves.toBeUndefined();

			expect(mockFindUnique).toHaveBeenCalledWith({
				where: { email: "new@example.com" },
			});
			expect(mockHash).toHaveBeenCalledWith("password123", {
				type: "argon2id",
			});
			expect(mockCreate).toHaveBeenCalledWith({
				data: {
					email: "new@example.com",
					passwordHash: "hashed-password",
					role: "USER",
				},
			});
		});

		it("should throw ConflictError when email is already in use", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 20,
				email: "existing@example.com",
				passwordHash: "stored-hash",
				role: "USER",
			});

			await expect(
				service.register({
					email: "existing@example.com",
					password: "password123",
				}),
			).rejects.toThrow("Email already in use");

			expect(mockHash).not.toHaveBeenCalled();
			expect(mockCreate).not.toHaveBeenCalled();
		});
	});
});
