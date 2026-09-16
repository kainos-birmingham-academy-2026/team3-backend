import { Router } from "express";

import { UserApplicationsController } from "../controllers/userApplicationsController";
import { CreateApplicationSchema } from "../dtos/jobRoleDto";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validate";
import { JobRolesService } from "../services/jobRolesService";

const userApplicationsRouter = Router();
const controller = new UserApplicationsController(new JobRolesService());

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

export default userApplicationsRouter;
