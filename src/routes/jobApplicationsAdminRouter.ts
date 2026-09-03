import { Router } from "express";
import { z } from "zod";

import { JobApplicationAdminController } from "../controllers/jobApplicationAdminController";
import { allowRoles, USER_ROLES } from "../middleware/authorise";
import { requireAuth } from "../middleware/requireAuth";
import { validateParams } from "../middleware/validate";
import { JobApplicationAdminService } from "../services/jobApplicationAdminService";

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

/**
 * @openapi
 * /job-applications/admin:
 *   get:
 *     tags: [Applications]
 *     summary: Get all job applications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of applications for administrators
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminApplicationListItem'
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden for non-admin roles
 *       500:
 *         description: Internal server error
 */
jobApplicationsAdminRouter.get("/", controller.getAllAdmin.bind(controller));

/**
 * @openapi
 * /job-applications/admin/{jobRoleId}/applications:
 *   get:
 *     tags: [Applications]
 *     summary: Get applications for a job role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobRoleId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: List of applications for the job role
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdminApplicationListItem'
 *       400:
 *         description: Invalid job role ID
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden for non-admin roles
 *       500:
 *         description: Internal server error
 */
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
