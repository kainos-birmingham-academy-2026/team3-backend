import type { Request, Response } from "express";
import type { JobRoleChatRequestDto } from "../dtos/jobRoleChatDto.js";
import { AzureOpenAIService } from "../services/azureOpenAIService.js";
import { JobRoleChatService } from "../services/jobRoleChatService.js";
import type { JobRolesService } from "../services/jobRolesService.js";

export class JobRoleChatController {
	constructor(private readonly jobRolesService: JobRolesService) {}

	async answer(req: Request, res: Response): Promise<void> {
		try {
			const { message } = req.body as JobRoleChatRequestDto;
			const service = new JobRoleChatService(
				this.jobRolesService,
				new AzureOpenAIService(),
			);
			res.status(200).json(await service.answer(message));
		} catch (error) {
			if (process.env.NODE_ENV !== "production") {
				console.error("Job role assistant request failed", error);
			}
			res.status(503).json({
				message: "The job role assistant is unavailable. Please try again later.",
			});
		}
	}
}