import { NotFoundError } from "error-lib";
import type { Request, Response } from "express";
import type { CreateApplicationRequestDto } from "../dtos/jobRoleDto.js";
import { ConflictError } from "../errors/conflictError.js";
import { INTERNAL_SERVER_ERROR } from "../errors/serverError.js";
import type { JobRolesService } from "../services/jobRolesService.js";

export class UserApplicationsController {
	public constructor(private readonly jobRolesService: JobRolesService) {}

	public async create(req: Request, res: Response): Promise<Response> {
		const { jobRoleId, cvText } = req.body as CreateApplicationRequestDto;
		const { userId } = res.locals.authUser as { userId: number };

		try {
			const application = await this.jobRolesService.createApplication(
				jobRoleId,
				userId,
				{ cvText },
			);
			return res.status(201).json(application);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			if (error instanceof ConflictError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
		}
	}

	public async getMine(_req: Request, res: Response): Promise<Response> {
		const { userId } = res.locals.authUser as { userId: number };

		try {
			const jobRoleIds =
				await this.jobRolesService.getAppliedJobRoleIds(userId);
			return res.status(200).json({ jobRoleIds });
		} catch {
			return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
		}
	}
}
