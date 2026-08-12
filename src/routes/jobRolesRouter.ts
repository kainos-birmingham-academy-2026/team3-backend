import { Router } from 'express';
import { Request as R, Response as Res } from 'express';

import { JobRolesController } from '../controllers/jobRolesController';
import { CreateJobRoleSchema, IdParamSchema } from '../dtos/jobRoleDto';
import { allowRoles, USER_ROLES } from '../middleware/authorise';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody, validateParams } from '../middleware/validate';
import { JobRolesService } from '../services/jobRolesService';

const jobRolesRouter = Router();
const controller = new JobRolesController(new JobRolesService());

jobRolesRouter.use(requireAuth);

/**
 * @openapi
 * /job-roles:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get all job roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of job role summaries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/JobRoleSummary'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       403:
 *         description: Forbidden for current role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
jobRolesRouter.get(
	'/',
	allowRoles([USER_ROLES.ADMIN, USER_ROLES.USER]),
	(req: R, res: Res) => {
		controller.getAll(req, res);
	},
);

/**
 * @openapi
 * /job-roles/{id}:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get job role details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Job role ID
 *     responses:
 *       200:
 *         description: Job role detailed response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobRoleDetailed'
 *       400:
 *         description: Invalid path parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       403:
 *         description: Forbidden for current role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       404:
 *         description: Job role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
jobRolesRouter.get(
	'/:id',
	allowRoles([USER_ROLES.ADMIN, USER_ROLES.USER]),
	validateParams(IdParamSchema),
	(req: R, res: Res) => {
		controller.getById(req, res);
	},
);

/**
 * @openapi
 * /job-roles:
 *   post:
 *     tags: [Job Roles]
 *     summary: Create a job role (mock endpoint for future implementation)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: false
 *             required:
 *               - roleName
 *               - description
 *               - responsibilities
 *               - sharepointUrl
 *               - numberOfOpenPositions
 *               - capabilityId
 *               - bandId
 *               - locationId
 *             properties:
 *               roleName:
 *                 type: string
 *               description:
 *                 type: string
 *               responsibilities:
 *                 type: string
 *               sharepointUrl:
 *                 type: string
 *                 format: uri
 *               numberOfOpenPositions:
 *                 type: integer
 *                 minimum: 1
 *               closingDate:
 *                 type: string
 *                 format: date-time
 *               capabilityId:
 *                 type: integer
 *                 minimum: 1
 *               bandId:
 *                 type: integer
 *                 minimum: 1
 *               locationId:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Mock create accepted with status set to OPEN
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: false
 *               required: [message, jobRoleDraft]
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mock create endpoint accepted
 *                 jobRoleDraft:
 *                   type: object
 *       400:
 *         description: Request validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       403:
 *         description: Forbidden for non-admin roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

jobRolesRouter.post(
	'/',
	allowRoles([USER_ROLES.ADMIN]),
	validateBody(CreateJobRoleSchema),
	(req: R, res: Res) => {
		controller.createMock(req, res);
	},
);

export default jobRolesRouter;
