import { Request, Response } from 'express';
import type { CreateJobRoleRequestDto } from '../dtos/jobRoleDto.js';
import { NotFoundError } from 'error-lib';
import { JobRolesService } from '../services/jobRolesService';
import { TOKEN_ERROR } from '../errors/authError.js';
import { ConflictError } from '../errors/conflictError.js';

export class JobRolesController {
    private service: JobRolesService;

    constructor(service: JobRolesService) {
        this.service = service;
    }

    async getAll(req: Request, res: Response) {
        try {
            const jobRoles = await this.service.findAll();
            return res.status(200).send(jobRoles);
        } catch {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getById(req: Request, res: Response) {
        const idParam = req.params.id;
        const jobRoleId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
        // This is redundant with validation middleware but kept as a defensive guard.
        if (isNaN(jobRoleId)) {
            return res.status(400).json({ error: 'Invalid job role ID' });
        }

        try {
            const jobRole = await this.service.findById(jobRoleId);
            return res.status(200).send(jobRole);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createApplication(req: Request, res: Response) {
        const idParam = req.params.id;
        const jobRoleId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
        //this is unnecessary due to validation middleware, but required for error handling 
        const userId = res.locals.authUser?.userId;
        if (!userId) {
            return res.status(401).json({ error: TOKEN_ERROR });
        }

        try {
            const application = await this.service.createApplication(jobRoleId, userId, req.body);
            res.status(201).json(application);
        } catch (error) {
            if (error instanceof NotFoundError) {
                return res.status(404).json({ error: error.message });
            }
            if (error instanceof ConflictError) {
                return res.status(error.statusCode).json({ error: error.message });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async createJobRole(req: Request, res: Response) {
        const payload = req.body as CreateJobRoleRequestDto;
        //nothing to attach to payload so can define type as dto
        if(payload.closingDate && payload.closingDate < new Date()) {
            return res.status(400).json({ error: 'Closing date cannot be in the past' });
        }

        try {
            const jobRole = await this.service.createJobRole(payload);
            return res.status(201).json(jobRole);
        } catch (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
    
}