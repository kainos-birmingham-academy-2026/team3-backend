import type { Request, Response } from "express";
import type {
	LoginRequestDto,
	LoginResponseDto,
} from "../dtos/authDto.js";
import { AuthError, type AuthService } from "../services/authService.js";

export class AuthController {
	public constructor(private readonly authService: AuthService) {}

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

		return res.status(500).json({ error: "Internal server error" });
	}
}
