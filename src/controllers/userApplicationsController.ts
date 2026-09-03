import { NotFoundError } from "error-lib";
import type { Request, Response } from "express";
import type { CreateApplicationRequestDto } from "../dtos/jobRoleDto.js";
import { ConflictError } from "../errors/conflictError.js";
import { INTERNAL_SERVER_ERROR } from "../errors/serverError.js";
import type { JobRolesService } from "../services/jobRolesService.js";
import type { UserApplicationsService } from "../services/userApplicationsService";

export class UserApplicationsController {
	public constructor(
		private readonly userApplicationsService: UserApplicationsService,
		private readonly jobRolesService: JobRolesService,
	) {}

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

	public async getAll(_req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = res.locals.authUser as { userId: number };
			const applications =
				await this.userApplicationsService.findAllForUser(userId);

			return res.status(200).json(applications);
		} catch {
			return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
		}
	}

	public async updateStatus(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = res.locals.authUser as { userId: number };
			const applicationId = Number(req.params.applicationId);
			const result = await this.userApplicationsService.withdrawApplication(
				applicationId,
				userId,
			);

			return res.status(200).json(result);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Application not found") {
					return res.status(404).json({ message: error.message });
				}

				if (error.message === "Only IN_PROGRESS applications can be withdrawn") {
					return res.status(409).json({ message: error.message });
				}
			}

			return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
		}
	}
}