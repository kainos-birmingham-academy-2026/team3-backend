import { Router } from 'express';
import { Request as R, Response as Res } from 'express';

import { JobRolesController } from '../controllers/jobRolesController';
import { JobRolesService } from '../services/jobRolesService';
import { validateParams } from '../middleware/validation';
import { IdParamSchema } from '../dtos/jobRoleDto';

const jobRolesRouter = Router();
const controller = new JobRolesController(new JobRolesService());

jobRolesRouter.get('/job-roles', (req: R, res: Res) => {
    controller.getAll(req, res);
});

jobRolesRouter.get('/job-roles/:id', validateParams(IdParamSchema), (req: R, res: Res) => {
    controller.getById(req, res);
});

export default jobRolesRouter;