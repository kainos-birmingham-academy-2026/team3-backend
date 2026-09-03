import { NotFoundError } from "error-lib";
import type { Request, Response } from "express";
import type {
	CreateJobRoleRequestDto,
	JobRoleFiltersDto,
	UpdateJobRoleRequestDto,
} from "../dtos/jobRoleDto.js";
import { TOKEN_ERROR } from "../errors/authError.js";
import { ConflictError } from "../errors/conflictError.js";
import type { JobRolesService } from "../services/jobRolesService";

export class JobRolesController {
	private service: JobRolesService;

	constructor(service: JobRolesService) {
		this.service = service;
	}

	async getAll(_req: Request, res: Response) {
		try {
			const filters = res.locals.validatedQuery as JobRoleFiltersDto;
			const jobRoles = await this.service.findAll(filters);
			return res.status(200).send(jobRoles);
		} catch {
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async getById(req: Request<{ jobRoleId: string }>, res: Response) {
		const idParam = req.params.jobRoleId;
		const jobRoleId = parseInt(idParam, 10);
		// This is redundant with validation middleware but kept as a defensive guard.
		if (Number.isNaN(jobRoleId)) {
			return res.status(400).json({ message: "Invalid job role ID" });
		}

		try {
			const jobRole = await this.service.findById(jobRoleId);
			return res.status(200).send(jobRole);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async createApplication(req: Request<{ jobRoleId: string }>, res: Response) {
		const idParam = req.params.jobRoleId;
		const jobRoleId = parseInt(idParam, 10);
		//this is unnecessary due to validation middleware, but required for error handling
		const userId = res.locals.authUser?.userId;
		if (!userId) {
			return res.status(401).json({ message: TOKEN_ERROR });
		}

		try {
			const application = await this.service.createApplication(
				jobRoleId,
				userId,
				req.body,
			);
			res.status(201).json(application);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			if (error instanceof ConflictError) {
				return res.status(error.statusCode).json({ message: error.message });
			}
			res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async createJobRole(req: Request, res: Response) {
		const payload = req.body as CreateJobRoleRequestDto;
		//nothing to attach to payload so can define type as dto
		if (payload.closingDate && payload.closingDate < new Date()) {
			return res
				.status(400)
				.json({ message: "Closing date cannot be in the past" });
		}

		try {
			const jobRole = await this.service.createJobRole(payload);
			return res.status(201).json(jobRole);
		} catch (_error) {
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async updateJobRole(req: Request<{ jobRoleId: string }>, res: Response) {
		const idParam = req.params.jobRoleId;
		const jobRoleId = parseInt(idParam, 10);
		const payload = req.body as UpdateJobRoleRequestDto;

		try {
			const jobRole = await this.service.updateJobRole(jobRoleId, payload);
			return res.status(200).json(jobRole);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async deleteJobRole(
		req: Request<{ jobRoleId: string }>,
		res: Response,
	) {
		const idParam = req.params.jobRoleId;
		const jobRoleId = parseInt(
			Array.isArray(idParam) ? idParam[0] : idParam,
			10,
		);

		try {
			await this.service.deleteJobRole(jobRoleId);
			return res.status(204).send();
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	//get status, band, capability, location for job role creation form
	async getStatus(_req: Request, res: Response) {
		try {
			const status = await this.service.getStatus();
			return res.status(200).json(status);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async getBands(_req: Request, res: Response) {
		try {
			const bands = await this.service.getBands();
			return res.status(200).json(bands);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async getCapabilities(_req: Request, res: Response) {
		try {
			const capabilities = await this.service.getCapabilities();
			return res.status(200).json(capabilities);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}

	async getLocations(_req: Request, res: Response) {
		try {
			const locations = await this.service.getLocations();
			return res.status(200).json(locations);
		} catch (error) {
			if (error instanceof NotFoundError) {
				return res.status(404).json({ message: error.message });
			}
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}
}
