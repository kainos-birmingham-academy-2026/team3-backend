import type { Request, Response } from "express";
import type { JobRoleChatRequestDto } from "../dtos/jobRoleChatDto.js";
import type { JobRoleChatService } from "../services/jobRoleChatService.js";

export class JobRoleChatController {
	constructor(private readonly service: JobRoleChatService) {}

	async answer(req: Request, res: Response): Promise<void> {
		try {
			const { message } = req.body as JobRoleChatRequestDto;
			res.status(200).json(await this.service.answer(message));
		} catch (error) {
			if (process.env.NODE_ENV !== "production") {
				console.error("Job role assistant request failed", error);
			}
			res.status(503).json({
				message:
					"The job role assistant is unavailable. Please try again later.",
			});
		}
	}
}
