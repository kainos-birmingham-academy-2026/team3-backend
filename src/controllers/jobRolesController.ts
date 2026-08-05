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


}