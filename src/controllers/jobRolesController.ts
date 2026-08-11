import { Request, Response } from 'express';
import { JobRolesService } from '../services/jobRolesService';

export class JobRolesController {
    private service: JobRolesService;

    constructor(service: JobRolesService) {
        this.service = service;
    }

    async getAll(req: Request, res: Response) {
        try {
            const jobRoles = await this.service.findAll();
            res.status(200).send(jobRoles);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async getById(req: Request, res: Response) {
        const idParam = req.params.id;
        const jobRoleId = parseInt(Array.isArray(idParam) ? idParam[0] : idParam, 10);
        //this is unnecessary due to validation middleware, but required for error handling 
        if (isNaN(jobRoleId)) {
            return res.status(400).json({ error: 'Invalid job role ID' });
        }
        
        try {
            const jobRole = await this.service.findById(jobRoleId);
            if (!jobRole) {
                return res.status(404).json({ error: 'Job role not found' });
            }
            res.status(200).send(jobRole);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


}