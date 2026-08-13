import { Router } from "express";
import { z } from "zod";

import { jobApplicationAdminController } from "../controllers/jobApplicationAdminController";
import { JobApplicationAdminService } from "../services/jobApplicationAdminService";
import { allowRoles, USER_ROLES } from "../middleware/authorise";
import { requireAuth } from "../middleware/requireAuth";
import { validateParams } from "../middleware/validate";

const jobApplicationsAdminRouter = Router();
const controller = new jobApplicationAdminController(
  new JobApplicationAdminService(),
);

const JobRoleIdParamSchema = z.object({
  jobRoleId: z.coerce.number().int().positive(),
});

const JobRoleAndApplicationIdParamSchema = z.object({
  jobRoleId: z.coerce.number().int().positive(),
  applicationId: z.coerce.number().int().positive(),
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

jobApplicationsAdminRouter.get("/:jobRoleId/applications",validateParams(JobRoleIdParamSchema)
,controller.getAll.bind(controller),
);

jobApplicationsAdminRouter.patch(
  "/:jobRoleId/applications/:applicationId/hire",
  validateParams(JobRoleAndApplicationIdParamSchema),
  controller.hire.bind(controller),
);

jobApplicationsAdminRouter.patch(
  "/:jobRoleId/applications/:applicationId/reject",
  validateParams(JobRoleAndApplicationIdParamSchema),
  controller.reject.bind(controller),
);

jobApplicationsAdminRouter.post(
  "/:applicationId/reject",
  validateParams(ApplicationIdParamSchema),
  controller.rejectById.bind(controller),
);

jobApplicationsAdminRouter.post(
  "/:applicationId/hire",
  validateParams(ApplicationIdParamSchema),
  controller.hireById.bind(controller),
);

jobApplicationsAdminRouter.post(
  "/:applicationId/approve",
  validateParams(ApplicationIdParamSchema),
  controller.hireById.bind(controller),
);

jobApplicationsAdminRouter.patch(
  "/:applicationId/approve",
  validateParams(ApplicationIdParamSchema),
  controller.hireById.bind(controller),
);

jobApplicationsAdminRouter.patch(
  "/:applicationId/status",
  validateParams(ApplicationIdParamSchema),
  controller.updateStatus.bind(controller),
);

jobApplicationsAdminRouter.put(
  "/:applicationId/status",
  validateParams(ApplicationIdParamSchema),
  controller.updateStatus.bind(controller),
);

jobApplicationsAdminRouter.post(
  "/:applicationId/status",
  validateParams(ApplicationIdParamSchema),
  controller.updateStatus.bind(controller),
);

jobApplicationsAdminRouter.patch(
  "/:applicationId",
  validateParams(ApplicationIdParamSchema),
  controller.updateStatus.bind(controller),
);

export default jobApplicationsAdminRouter;