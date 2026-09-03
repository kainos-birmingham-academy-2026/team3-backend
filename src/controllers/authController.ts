import type { Request, Response } from "express";
import type {
	LoginRequestDto,
	LoginResponseDto,
	RegisterRequestDto,
	RegisterResponseDto,
} from "../dtos/authDto.js";
import { AuthError } from "../errors/authError.js";
import { ConflictError } from "../errors/conflictError.js";
import { INTERNAL_SERVER_ERROR } from "../errors/serverError.js";
import type { AuthService } from "../services/authService.js";

export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	public async register(req: Request, res: Response): Promise<Response> {
		try {
			await this.authService.register(req.body as RegisterRequestDto);

			return res.status(201).json({
				message: "User registered",
			} satisfies RegisterResponseDto);
		} catch (error) {
			return this.handleError(error, res);
		}
	}

	public async login(req: Request, res: Response): Promise<Response> {
		try {
			const token = await this.authService.login(req.body as LoginRequestDto);

			return res.status(200).json({ token } satisfies LoginResponseDto);
		} catch (error) {
			return this.handleError(error, res);
		}
	}

	private handleError(error: unknown, res: Response): Response {
		if (error instanceof AuthError) {
			return res.status(error.statusCode).json({ message: error.message });
		}

		if (error instanceof ConflictError) {
			return res.status(error.statusCode).json({ message: error.message });
		}

		return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
	}
}
