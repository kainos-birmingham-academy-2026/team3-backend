import type { Request, Response } from "express";
import type { UserApplicationsService } from "../services/userApplicationsService";

export class UserApplicationsController {
	public constructor(
		private readonly userApplicationsService: UserApplicationsService,
	) {}

	public async getAll(req: Request, res: Response): Promise<Response> {
		try {
			const { userId } = res.locals.authUser as { userId: number };
			const applications =
				await this.userApplicationsService.findAllForUser(userId);

			return res.status(200).send(applications);
		} catch {
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	public async withdraw(req: Request, res: Response): Promise<Response> {
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

			return res.status(500).json({ message: "Internal Server Error" });
		}
	}
}