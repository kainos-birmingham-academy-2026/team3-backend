import { Request, Response } from 'express';

export class JobRoleController{
    //service here 

    async getAll(req: Request, res: Response){
        try {
            const jobRoles = await this.service.getAll();
            res.json(jobRoles);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }


}