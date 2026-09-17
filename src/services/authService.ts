import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";
import type {
	LoginRequestDto,
	RegisterRequestDto,
	VerifyEmailRequestDto,
} from "../dtos/authDto.js";
import { AuthError, LOGIN_ERROR } from "../errors/authError.js";
import { ConflictError } from "../errors/conflictError.js";
import { publishNotification } from "../notificationPublisher.js";
import prisma from "../prismaClient.js";

export class AuthService {
	public async register(input: RegisterRequestDto): Promise<void> {
		const existingUser = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (existingUser) {
			throw new ConflictError(409, "Email already in use");
		}

		const passwordHash = await argon2.hash(input.password, {
			type: argon2.argon2id,
		});
		const verificationCode = randomInt(10_000, 100_000).toString();
		const verificationCodeHash = await argon2.hash(verificationCode, {
			type: argon2.argon2id,
		});

		await prisma.user.create({
			data: {
				email: input.email,
				passwordHash,
				role: "USER",
				verificationCodeHash,
				verificationCodeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
			},
		});

		try {
			await publishNotification("AccountCreated", input.email, {
				code: verificationCode,
			});
		} catch {
			console.error("Failed to publish AccountCreated notification");
		}
	}

	public async login(input: LoginRequestDto): Promise<string> {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (!user) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		const validPassword = await argon2.verify(
			user.passwordHash,
			input.password,
		);

		if (!validPassword) {
			throw new AuthError(401, LOGIN_ERROR);
		}

		if (user.emailVerified === false) {
			throw new AuthError(403, "Verify your email before signing in");
		}

		const secret = process.env.JWT_SECRET;

		if (!secret) {
			throw new Error("JWT_SECRET is not configured");
		}

		const userRecord = user as Record<string, unknown>;
		const role = userRecord.role === "ADMIN" ? "ADMIN" : "USER";

		return jwt.sign({ userId: user.id, email: user.email, role }, secret, {
			expiresIn: "1h",
		});
	}

	public async verifyEmail(input: VerifyEmailRequestDto): Promise<void> {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (
			!user?.verificationCodeHash ||
			!user.verificationCodeExpiresAt ||
			user.verificationCodeExpiresAt < new Date() ||
			!(await argon2.verify(
				user.verificationCodeHash,
				input.verificationCode,
			))
		) {
			throw new AuthError(400, "Invalid or expired verification code");
		}

		await prisma.user.update({
			where: { email: input.email },
			data: {
				emailVerified: true,
				verificationCodeHash: null,
				verificationCodeExpiresAt: null,
			},
		});
	}
}
