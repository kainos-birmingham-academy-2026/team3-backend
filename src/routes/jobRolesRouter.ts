import { Router } from 'express';
import { Request as R, Response as Res } from 'express';

import { JobRolesController } from '../controllers/jobRolesController';
import { JobRolesService } from '../services/jobRolesService';

const jobRolesRouter = Router();
const controller = new JobRolesController(new JobRolesService());

jobRolesRouter.get('/job-roles', (req: R, res: Res) => {
    controller.getAll(req, res);
});

export default jobRolesRouter;