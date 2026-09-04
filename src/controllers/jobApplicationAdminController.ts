import type { Request, Response } from "express";
import { INTERNAL_SERVER_ERROR } from "../errors/serverError.js";
import type { JobApplicationAdminService } from "../services/jobApplicationAdminService";

export class JobApplicationAdminController {
	private readonly service: JobApplicationAdminService;

	constructor(service: JobApplicationAdminService) {
		this.service = service;
	}

	async getAllAdmin(_req: Request, res: Response) {
		try {
			const { jobRoleId, page, pageSize } = res.locals.validatedQuery as {
				jobRoleId?: number;
				page: number;
				pageSize: number;
			};
			const jobApplications = await this.service.findAllAdmin({
				jobRoleId,
				page,
				pageSize,
			});
			return res.status(200).json(jobApplications);
		} catch (error) {
			return this.handleStatusErrors(error, res);
		}
	}

	async updateStatus(req: Request, res: Response) {
		try {
			const applicationId = Number(req.params.applicationId);
			const { status } = req.body as { status: string };

			const result = await this.service.updateApplicationStatusById(
				applicationId,
				status,
			);
			return res.status(200).json(result);
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === "Unsupported application status"
			) {
				return res.status(400).json({
					message: "Unsupported status. Use HIRED or REJECTED",
				});
			}

			return this.handleStatusErrors(error, res);
		}
	}

	private handleStatusErrors(error: unknown, res: Response) {
		if (error instanceof Error) {
			if (error.message === "Application not found") {
				return res.status(404).json({ message: error.message });
			}

			if (
				error.message === "Only IN_PROGRESS applications can be hired" ||
				error.message === "Only IN_PROGRESS applications can be rejected" ||
				error.message === "No open positions remaining for this role"
			) {
				return res.status(409).json({ message: error.message });
			}
		}

		return res.status(500).json({ message: INTERNAL_SERVER_ERROR });
	}
}
