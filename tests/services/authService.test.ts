import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "../../src/services/authService.ts";

const {
	mockFindUnique,
	mockCreate,
	mockDelete,
	mockUpdateMany,
	mockHash,
	mockVerify,
	mockSign,
	mockPublishNotification,
} = vi.hoisted(() => {
	return {
		mockFindUnique: vi.fn(),
		mockCreate: vi.fn(),
		mockDelete: vi.fn(),
		mockUpdateMany: vi.fn(),
		mockHash: vi.fn(),
		mockVerify: vi.fn(),
		mockSign: vi.fn(),
		mockPublishNotification: vi.fn(),
	};
});

vi.mock("../../src/prismaClient.ts", () => {
	return {
		default: {
			user: {
				findUnique: mockFindUnique,
				create: mockCreate,
				delete: mockDelete,
				updateMany: mockUpdateMany,
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

vi.mock("../../src/notificationPublisher.ts", () => {
	return {
		publishNotification: mockPublishNotification,
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
			mockHash
				.mockResolvedValueOnce("hashed-password")
				.mockResolvedValueOnce("hashed-verification-code");
			mockCreate.mockResolvedValueOnce({ id: 42 });

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
					verificationCodeHash: "hashed-verification-code",
					verificationCodeExpiresAt: expect.any(Date),
				},
			});
			expect(mockPublishNotification).toHaveBeenCalledWith(
				"AccountCreated",
				"new@example.com",
				{ code: expect.stringMatching(/^\d{5}$/) },
			);
		});

		it("should remove the unverified user when notification publishing fails", async () => {
			mockFindUnique.mockResolvedValueOnce(null);
			mockHash
				.mockResolvedValueOnce("hashed-password")
				.mockResolvedValueOnce("hashed-verification-code");
			mockCreate.mockResolvedValueOnce({ id: 42 });
			mockPublishNotification.mockRejectedValueOnce(
				new Error("Service Bus unavailable"),
			);

			await expect(
				service.register({
					email: "new@example.com",
					password: "password123",
				}),
			).rejects.toThrow("Service Bus unavailable");

			expect(mockCreate).toHaveBeenCalledOnce();
			expect(mockDelete).toHaveBeenCalledWith({ where: { id: 42 } });
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
			expect(mockPublishNotification).not.toHaveBeenCalled();
		});
	});

	describe("verifyEmail", () => {
		it("should verify a valid code within the attempt limit", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				verificationCodeHash: "stored-code-hash",
				verificationCodeExpiresAt: new Date(Date.now() + 60_000),
				verificationAttempts: 0,
			});
			mockUpdateMany
				.mockResolvedValueOnce({ count: 1 })
				.mockResolvedValueOnce({ count: 1 });
			mockVerify.mockResolvedValueOnce(true);

			await expect(
				service.verifyEmail({
					email: "new@example.com",
					verificationCode: "12345",
				}),
			).resolves.toBeUndefined();

			expect(mockUpdateMany).toHaveBeenLastCalledWith({
				where: {
					id: 42,
					emailVerified: false,
					verificationCodeHash: "stored-code-hash",
					verificationAttempts: 1,
				},
				data: {
					emailVerified: true,
					verificationCodeHash: null,
					verificationCodeExpiresAt: null,
					verificationAttempts: 0,
				},
			});
		});

		it("should count an invalid verification attempt", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				verificationCodeHash: "stored-code-hash",
				verificationCodeExpiresAt: new Date(Date.now() + 60_000),
				verificationAttempts: 1,
			});
			mockUpdateMany.mockResolvedValueOnce({ count: 1 });
			mockVerify.mockResolvedValueOnce(false);

			await expect(
				service.verifyEmail({
					email: "new@example.com",
					verificationCode: "99999",
				}),
			).rejects.toThrow("Invalid or expired verification code");

			expect(mockUpdateMany).toHaveBeenCalledWith(
				expect.objectContaining({
					data: { verificationAttempts: { increment: 1 } },
				}),
			);
			expect(mockUpdateMany).toHaveBeenCalledOnce();
		});

		it("should invalidate the code after the fifth failed attempt", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				verificationCodeHash: "stored-code-hash",
				verificationCodeExpiresAt: new Date(Date.now() + 60_000),
				verificationAttempts: 4,
			});
			mockUpdateMany.mockResolvedValueOnce({ count: 1 });
			mockVerify.mockResolvedValueOnce(false);

			await expect(
				service.verifyEmail({
					email: "new@example.com",
					verificationCode: "99999",
				}),
			).rejects.toThrow("Invalid or expired verification code");

			expect(mockUpdateMany).toHaveBeenLastCalledWith({
				where: {
					id: 42,
					emailVerified: false,
					verificationCodeHash: "stored-code-hash",
					verificationAttempts: 5,
				},
				data: {
					verificationCodeHash: null,
					verificationCodeExpiresAt: null,
				},
			});
		});

		it("should reject a concurrent attempt that did not claim the counter", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				verificationCodeHash: "stored-code-hash",
				verificationCodeExpiresAt: new Date(Date.now() + 60_000),
				verificationAttempts: 1,
			});
			mockUpdateMany.mockResolvedValueOnce({ count: 0 });

			await expect(
				service.verifyEmail({
					email: "new@example.com",
					verificationCode: "12345",
				}),
			).rejects.toThrow("Invalid or expired verification code");

			expect(mockVerify).not.toHaveBeenCalled();
		});
	});

	describe("resendVerificationCode", () => {
		it("should rotate and publish a new code for an unverified user", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				emailVerified: false,
				verificationCodeHash: null,
				verificationCodeExpiresAt: null,
				verificationAttempts: 5,
			});
			mockHash.mockResolvedValueOnce("new-code-hash");
			mockUpdateMany.mockResolvedValueOnce({ count: 1 });

			await service.resendVerificationCode({ email: "new@example.com" });

			expect(mockUpdateMany).toHaveBeenCalledWith({
				where: {
					id: 42,
					emailVerified: false,
					verificationCodeHash: null,
					verificationCodeExpiresAt: null,
					verificationAttempts: 5,
				},
				data: {
					verificationCodeHash: "new-code-hash",
					verificationCodeExpiresAt: expect.any(Date),
					verificationAttempts: 0,
				},
			});
			expect(mockPublishNotification).toHaveBeenCalledWith(
				"AccountCreated",
				"new@example.com",
				{ code: expect.stringMatching(/^\d{5}$/) },
			);
		});

		it("should not reveal whether the email belongs to an unverified user", async () => {
			mockFindUnique.mockResolvedValueOnce(null);

			await expect(
				service.resendVerificationCode({ email: "missing@example.com" }),
			).resolves.toBeUndefined();

			expect(mockHash).not.toHaveBeenCalled();
			expect(mockPublishNotification).not.toHaveBeenCalled();
		});

		it("should not publish when another resend already rotated the code", async () => {
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				emailVerified: false,
				verificationCodeHash: "stored-code-hash",
				verificationCodeExpiresAt: new Date(Date.now() + 60_000),
				verificationAttempts: 1,
			});
			mockHash.mockResolvedValueOnce("new-code-hash");
			mockUpdateMany.mockResolvedValueOnce({ count: 0 });

			await service.resendVerificationCode({ email: "new@example.com" });

			expect(mockPublishNotification).not.toHaveBeenCalled();
		});

		it("should hide notification failures and restore the previous code", async () => {
			const consoleError = vi
				.spyOn(console, "error")
				.mockImplementation(() => undefined);
			const previousExpiry = new Date(Date.now() + 60_000);
			const publishError = new Error("Service Bus unavailable");
			mockFindUnique.mockResolvedValueOnce({
				id: 42,
				emailVerified: false,
				verificationCodeHash: "stored-code-hash",
				verificationCodeExpiresAt: previousExpiry,
				verificationAttempts: 2,
			});
			mockHash.mockResolvedValueOnce("new-code-hash");
			mockUpdateMany
				.mockResolvedValueOnce({ count: 1 })
				.mockResolvedValueOnce({ count: 1 });
			mockPublishNotification.mockRejectedValueOnce(publishError);

			await expect(
				service.resendVerificationCode({ email: "new@example.com" }),
			).resolves.toBeUndefined();

			expect(mockUpdateMany).toHaveBeenLastCalledWith({
				where: {
					id: 42,
					emailVerified: false,
					verificationCodeHash: "new-code-hash",
				},
				data: {
					verificationCodeHash: "stored-code-hash",
					verificationCodeExpiresAt: previousExpiry,
					verificationAttempts: 2,
				},
			});
			expect(consoleError).toHaveBeenCalledWith(
				"Failed to resend verification code",
				publishError,
			);
		});
	});
});
