import { Router } from 'express';
import { Request as R, Response as Res } from 'express';

import { JobRolesController } from '../controllers/jobRolesController';
import { JobRolesService } from '../services/jobRolesService';
import { validateParams } from '../middleware/validate';
import { IdParamSchema } from '../dtos/jobRoleDto';

const jobRolesRouter = Router();
const controller = new JobRolesController(new JobRolesService());

/**
 * @openapi
 * /job-roles:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get all job roles
 *     responses:
 *       200:
 *         description: List of job role summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobRoleSummary'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
jobRolesRouter.get('/job-roles', (req: R, res: Res) => {
    controller.getAll(req, res);
});

jobRolesRouter.get('/job-roles/:id', validateParams(IdParamSchema), (req: R, res: Res) => {
    controller.getById(req, res);
});

export default jobRolesRouter;