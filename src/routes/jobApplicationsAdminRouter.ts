import { Router } from "express";
import { z } from "zod";

import { JobApplicationAdminController } from "../controllers/jobApplicationAdminController";
import { allowRoles, USER_ROLES } from "../middleware/authorise";
import { requireAuth } from "../middleware/requireAuth";
import {
	validateBody,
	validateParams,
	validateQuery,
} from "../middleware/validate";
import { JobApplicationAdminService } from "../services/jobApplicationAdminService";

const jobApplicationsAdminRouter = Router();
const controller = new JobApplicationAdminController(
	new JobApplicationAdminService(),
);

const AdminApplicationsQuerySchema = z.strictObject({
	jobRoleId: z.coerce.number().int().positive().optional(),
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(10),
});

const ApplicationIdParamSchema = z.object({
	applicationId: z.coerce.number().int().positive(),
});

const UpdateApplicationStatusSchema = z.strictObject({
	status: z.enum(["HIRED", "REJECTED"]),
});

jobApplicationsAdminRouter.use(requireAuth);
jobApplicationsAdminRouter.use(allowRoles([USER_ROLES.ADMIN]));

/**
 * @openapi
 * /api/job-applications/admin:
 *   get:
 *     tags: [Applications]
 *     summary: Get all job applications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: jobRoleId
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter applications by job role ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: List of applications for administrators
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminApplicationListItem'
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden for non-admin roles
 *       500:
 *         description: Internal server error
 */
jobApplicationsAdminRouter.get(
	"/",
	validateQuery(AdminApplicationsQuerySchema),
	controller.getAllAdmin.bind(controller),
);

/**
 * @openapi
 * /api/job-applications/admin/{applicationId}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Update an application's status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: Application status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminApplicationStatusResponse'
 *       400:
 *         description: Invalid request or unsupported status
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden for non-admin roles
 *       404:
 *         description: Application not found
 *       409:
 *         description: Application cannot transition from its current status
 *       500:
 *         description: Internal server error
 */
jobApplicationsAdminRouter.patch(
	"/:applicationId/status",
	validateParams(ApplicationIdParamSchema),
	validateBody(UpdateApplicationStatusSchema),
	controller.updateStatus.bind(controller),
);

export default jobApplicationsAdminRouter;
