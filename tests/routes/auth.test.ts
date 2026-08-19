import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../../src/index.ts";

const { serviceMock } = vi.hoisted(() => ({
	serviceMock: {
		login: vi.fn(),
		register: vi.fn(),
	},
}));

vi.mock("../../src/services/authService.js", () => ({
	AuthService: class AuthService {
		login = serviceMock.login;
		register = serviceMock.register;
	},
}));

// Import error classes from source - don't mock them
import { AuthError } from "../../src/errors/authError.ts";
import { ConflictError } from "../../src/errors/conflictError.ts";

describe("POST /api/register", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should return 400 for invalid email format", async () => {
		const response = await request(app).post("/api/register").send({
			email: "not-an-email",
			password: "Password123!",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "email",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should return 400 for weak registration password", async () => {
		const response = await request(app).post("/api/register").send({
			email: "new@example.com",
			password: "password123",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "password",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should return 201 when registration succeeds", async () => {
		serviceMock.register.mockResolvedValueOnce(undefined);

		const response = await request(app).post("/api/register").send({
			email: "new@example.com",
			password: "Password123!",
		});

		expect(response.status).toBe(201);
		expect(response.body).toEqual({ message: "User registered" });
	});

	it("should return 409 when email already exists", async () => {
		serviceMock.register.mockRejectedValueOnce(
			new ConflictError(409, "Email already in use"),
		);

		const response = await request(app).post("/api/register").send({
			email: "existing@example.com",
			password: "Password123!",
		});

		expect(response.status).toBe(409);
		expect(response.body).toEqual({ message: "Email already in use" });
	});
});

describe("POST /api/login", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should return 400 for invalid email format", async () => {
		const response = await request(app).post("/api/login").send({
			email: "not-an-email",
			password: "password123",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "email",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should return 400 when password is missing", async () => {
		const response = await request(app).post("/api/login").send({
			email: "user@example.com",
		});

		expect(response.status).toBe(400);
		expect(response.body).toEqual({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "password",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should return 401 when service rejects with auth error", async () => {
		serviceMock.login.mockRejectedValueOnce(
			new AuthError(401, "Invalid email or password"),
		);

		const response = await request(app).post("/api/login").send({
			email: "user@example.com",
			password: "wrong-password",
		});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ message: "Invalid email or password" });
	});

	it("should return token for valid credentials", async () => {
		serviceMock.login.mockResolvedValueOnce("mock-jwt-token");

		const response = await request(app).post("/api/login").send({
			email: "user@example.com",
			password: "password123",
		});

		expect(response.status).toBe(200);
		expect(response.body).toEqual({ token: "mock-jwt-token" });
	});
});
