import { Router } from "express";
import { z } from "zod";

import { UserApplicationsController } from "../controllers/userApplicationsController";
import { CreateApplicationSchema } from "../dtos/jobRoleDto";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody, validateParams } from "../middleware/validate";
import { JobRolesService } from "../services/jobRolesService";
import { UserApplicationsService } from "../services/userApplicationsService";

const userApplicationsRouter = Router();
const controller = new UserApplicationsController(
    new UserApplicationsService(),
    new JobRolesService(),
);
const ApplicationIdParamSchema = z.object({
    applicationId: z.coerce.number().int().positive(),
});
const WithdrawalStatusSchema = z.strictObject({
    status: z.literal("WITHDRAWN"),
});

userApplicationsRouter.use(requireAuth);

/**
 * @openapi
 * /api/job-applications:
 *   post:
 *     tags: [Applications]
 *     summary: Apply for a job role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplicationRequest'
 *     responses:
 *       201:
 *         description: Application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRoleApplicationResponse'
 *       400:
 *         description: Request validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Job role not found
 *       409:
 *         description: User has already applied for the job role
 *       500:
 *         description: Internal server error
 */
userApplicationsRouter.post(
    "/",
    validateBody(CreateApplicationSchema),
    controller.create.bind(controller),
);

/**
 * @openapi
 * /api/job-applications:
 *   get:
 *     tags: [Applications]
 *     summary: Get the authenticated user's applications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the user's applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserApplicationListItem'
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Internal server error
 */
userApplicationsRouter.get("/", controller.getAll.bind(controller));

/**
 * @openapi
 * /api/job-applications/{applicationId}/status:
 *   patch:
 *     tags: [Applications]
 *     summary: Withdraw the authenticated user's application
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
 *             $ref: '#/components/schemas/WithdrawApplicationRequest'
 *     responses:
 *       200:
 *         description: Application withdrawn successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       400:
 *         description: Request validation failed
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Application not found
 *       409:
 *         description: Application cannot be withdrawn from its current status
 *       500:
 *         description: Internal server error
 */
userApplicationsRouter.patch(
    "/:applicationId/status",
    validateParams(ApplicationIdParamSchema),
    validateBody(WithdrawalStatusSchema),
    controller.updateStatus.bind(controller),
);

export default userApplicationsRouter;