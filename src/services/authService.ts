import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { randomInt } from "node:crypto";
import type {
	LoginRequestDto,
	RegisterRequestDto,
	ResendVerificationRequestDto,
	VerifyEmailRequestDto,
} from "../dtos/authDto.js";
import { AuthError, LOGIN_ERROR } from "../errors/authError.js";
import { ConflictError } from "../errors/conflictError.js";
import { publishNotification } from "../notificationPublisher.js";
import prisma from "../prismaClient.js";

const MAX_VERIFICATION_ATTEMPTS = 5;

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

		const user = await prisma.user.create({
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
		} catch (error) {
			await prisma.user.delete({ where: { id: user.id } });
			throw error;
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
			user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS
		) {
			throw new AuthError(400, "Invalid or expired verification code");
		}

		const claimedAttempt = await prisma.user.updateMany({
			where: {
				id: user.id,
				emailVerified: false,
				verificationCodeHash: { not: null },
				verificationCodeExpiresAt: { gt: new Date() },
				verificationAttempts: user.verificationAttempts,
			},
			data: { verificationAttempts: { increment: 1 } },
		});

		if (claimedAttempt.count === 0) {
			throw new AuthError(400, "Invalid or expired verification code");
		}

		const validCode = await argon2.verify(
			user.verificationCodeHash,
			input.verificationCode,
		);
		const claimedAttemptCount = user.verificationAttempts + 1;

		if (!validCode) {
			if (claimedAttemptCount >= MAX_VERIFICATION_ATTEMPTS) {
				await prisma.user.updateMany({
					where: {
						id: user.id,
						emailVerified: false,
						verificationCodeHash: user.verificationCodeHash,
						verificationAttempts: claimedAttemptCount,
					},
					data: {
						verificationCodeHash: null,
						verificationCodeExpiresAt: null,
					},
				});
			}

			throw new AuthError(400, "Invalid or expired verification code");
		}

		const verified = await prisma.user.updateMany({
			where: {
				id: user.id,
				emailVerified: false,
				verificationCodeHash: user.verificationCodeHash,
				verificationAttempts: claimedAttemptCount,
			},
			data: {
				emailVerified: true,
				verificationCodeHash: null,
				verificationCodeExpiresAt: null,
				verificationAttempts: 0,
			},
		});

		if (verified.count === 0) {
			throw new AuthError(400, "Invalid or expired verification code");
		}
	}

	public async resendVerificationCode(
		input: ResendVerificationRequestDto,
	): Promise<void> {
		const user = await prisma.user.findUnique({
			where: { email: input.email },
		});

		if (!user || user.emailVerified) {
			return;
		}

		const verificationCode = randomInt(10_000, 100_000).toString();
		const verificationCodeHash = await argon2.hash(verificationCode, {
			type: argon2.argon2id,
		});
		const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
		const rotated = await prisma.user.updateMany({
			where: {
				id: user.id,
				emailVerified: false,
				verificationCodeHash: user.verificationCodeHash,
				verificationCodeExpiresAt: user.verificationCodeExpiresAt,
				verificationAttempts: user.verificationAttempts,
			},
			data: {
				verificationCodeHash,
				verificationCodeExpiresAt,
				verificationAttempts: 0,
			},
		});

		if (rotated.count === 0) {
			return;
		}

		try {
			await publishNotification("AccountCreated", input.email, {
				code: verificationCode,
			});
		} catch (error) {
			await prisma.user.updateMany({
				where: {
					id: user.id,
					emailVerified: false,
					verificationCodeHash,
				},
				data: {
					verificationCodeHash: user.verificationCodeHash,
					verificationCodeExpiresAt: user.verificationCodeExpiresAt,
					verificationAttempts: user.verificationAttempts,
				},
			});
			console.error("Failed to resend verification code", error);
		}
	}
}
