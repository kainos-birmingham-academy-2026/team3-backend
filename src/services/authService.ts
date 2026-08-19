import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { LoginRequestDto, RegisterRequestDto } from "../dtos/authDto.js";
import { AuthError, LOGIN_ERROR } from "../errors/authError.js";
import { ConflictError } from "../errors/conflictError.js";
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

		await prisma.user.create({
			data: {
				email: input.email,
				passwordHash,
				role: "USER",
			},
		});
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
}
