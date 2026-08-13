import { JobApplicationAdminService } from '../services/jobApplicationAdminService'
import { Request, Response } from 'express';

export class JobApplicationAdminController {
    private service: JobApplicationAdminService;

    constructor(service: JobApplicationAdminService) {
            this.service = service;
        }


         async getAllAdmin(req: Request, res: Response) {
                try {
                    const jobApplications = await this.service.findAllAdmin();
                    return res.status(200).send(jobApplications);
                } catch (error) {
                    return this.handleStatusErrors(error, res);
                }
            }

         async getAll(req: Request, res: Response) {
                try {
                    const jobRoleId = Number(req.params.jobRoleId);
                    const jobApplications = await this.service.findAll(jobRoleId);
                    return res.status(200).send(jobApplications);
                } catch (error) {
                    return this.handleStatusErrors(error, res);
                }
            }

        async updateStatus(req: Request, res: Response) {
            try {
                const applicationId = Number(req.params.applicationId);
                const body = req.body as {
                    status?: string;
                    applicationStatus?: string;
                    action?: string;
                    decision?: string;
                    newStatus?: string;
                };
                const requestedStatus =
                    body.status ??
                    body.applicationStatus ??
                    body.action ??
                    body.decision ??
                    body.newStatus;

                if (!requestedStatus || typeof requestedStatus !== 'string') {
                    return res.status(400).json({
                        message: 'status (or applicationStatus/action/decision/newStatus) is required',
                    });
                }

                const result = await this.service.updateApplicationStatusById(applicationId, requestedStatus);
                return res.status(200).json(result);
            } catch (error) {
                if (error instanceof Error && error.message === 'Unsupported application status') {
                    return res.status(400).json({
                        message: 'Unsupported status. Use HIRED/APPROVED or REJECTED',
                    });
                }

                return this.handleStatusErrors(error, res);
            }
        }

        private handleStatusErrors(error: unknown, res: Response) {
            if (error instanceof Error) {
                if (error.message === 'Application not found') {
                    return res.status(404).json({ message: error.message });
                }

                if (
                    error.message === 'Only IN_PROGRESS applications can be hired' ||
                    error.message === 'Only IN_PROGRESS applications can be rejected' ||
                    error.message === 'No open positions remaining for this role'
                ) {
                    return res.status(409).json({ message: error.message });
                }
            }

            return res.status(500).json({ error: 'Internal Server Error' });
        }
         

}