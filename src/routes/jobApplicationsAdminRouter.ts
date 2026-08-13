import { Router } from "express";
import { z } from "zod";

import { JobApplicationAdminController } from "../controllers/jobApplicationAdminController";
import { JobApplicationAdminService } from "../services/jobApplicationAdminService";
import { allowRoles, USER_ROLES } from "../middleware/authorise";
import { requireAuth } from "../middleware/requireAuth";
import { validateParams } from "../middleware/validate";

const jobApplicationsAdminRouter = Router();
const controller = new JobApplicationAdminController(
  new JobApplicationAdminService(),
);

const JobRoleIdParamSchema = z.object({
  jobRoleId: z.coerce.number().int().positive(),
});

const ApplicationIdParamSchema = z.object({
  applicationId: z.coerce.number().int().positive(),
});

jobApplicationsAdminRouter.use(requireAuth);
jobApplicationsAdminRouter.use(allowRoles([USER_ROLES.ADMIN]));

jobApplicationsAdminRouter.get(
  "/",
  controller.getAllAdmin.bind(controller),
);

jobApplicationsAdminRouter.get(
  "/:jobRoleId/applications",
  validateParams(JobRoleIdParamSchema),
  controller.getAll.bind(controller),
);

jobApplicationsAdminRouter.patch(
  "/:applicationId/status",
  validateParams(ApplicationIdParamSchema),
  controller.updateStatus.bind(controller),
);

export default jobApplicationsAdminRouter;