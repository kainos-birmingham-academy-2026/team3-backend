import { Router } from 'express';
import { Request as R, Response as Res } from 'express';

import { CreateJobRoleSchema, IdParamSchema, CreateApplicationSchema, UpdateJobRoleSchema } from '../dtos/jobRoleDto';

import { JobRolesController } from '../controllers/jobRolesController';
import { JobRolesService } from '../services/jobRolesService';

import { allowRoles, USER_ROLES } from '../middleware/authorise';
import { requireAuth } from '../middleware/requireAuth';
import { validateBody, validateParams } from '../middleware/validate';


const jobRolesRouter = Router();
const controller = new JobRolesController(new JobRolesService());

/**
 * @openapi
 * /job-roles/statuses:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get available job role statuses
 *     responses:
 *       200:
 *         description: List of statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StatusResponse'
 *       404:
 *         description: No statuses found
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
	'/statuses',
	(req: R, res: Res) => {
		controller.getStatus(req, res);
	},
);

/**
 * @openapi
 * /job-roles/bands:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get available job role bands
 *     responses:
 *       200:
 *         description: List of bands
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BandResponse'
 *       404:
 *         description: No bands found
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
	'/bands',
	(req: R, res: Res) => {
		controller.getBands(req, res);
	},
);

/**
 * @openapi
 * /job-roles/capabilities:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get available job role capabilities
 *     responses:
 *       200:
 *         description: List of capabilities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CapabilityResponse'
 *       404:
 *         description: No capabilities found
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
	'/capabilities',
	(req: R, res: Res) => {
		controller.getCapabilities(req, res);
	},
);

/**
 * @openapi
 * /job-roles/locations:
 *   get:
 *     tags: [Job Roles]
 *     summary: Get available job role locations
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LocationResponse'
 *       404:
 *         description: No locations found
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
	'/locations',
	(req: R, res: Res) => {
		controller.getLocations(req, res);
	},
);

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
jobRolesRouter.get(
	'',
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
	validateParams(IdParamSchema),
	(req: R, res: Res) => {
		controller.getById(req, res);
	},
);

/**
 * @openapi
 * /job-roles/create:
 *   post:
 *     tags: [Job Roles]
 *     summary: Create a job role
 *     description: Admin-only endpoint. Creates a new job role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobRoleRequest'
 *     responses:
 *       201:
 *         description: Mock create accepted with status set to OPEN
 *         content:
 *           application/json:
 *             schema:
 *              $ref: '#/components/schemas/JobRoleSummary'
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
	'/create',
	requireAuth,
	allowRoles([USER_ROLES.ADMIN]),
	validateBody(CreateJobRoleSchema),
	(req: R, res: Res) => {
		controller.createJobRole(req, res);
	},
);

/**
 * @openapi
 * /job-roles/{id}:
 *   patch:
 *     tags: [Job Roles]
 *     summary: Update a job role
 *     description: Admin-only endpoint. Updates all editable job role fields.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateJobRoleRequest'
 *     responses:
 *       200:
 *         description: Updated job role
 *       400:
 *         description: Request validation failed
 *       401:
 *         description: Missing or invalid token
 *       403:
 *         description: Forbidden for non-admin roles
 *       404:
 *         description: Job role not found
 */
jobRolesRouter.patch(
	'/:id',
	requireAuth,
	allowRoles([USER_ROLES.ADMIN]),
	validateParams(IdParamSchema),
	validateBody(UpdateJobRoleSchema),
	(req: R, res: Res) => {
		controller.updateJobRole(req, res);
	},
);

/**
 * @openapi
 * /job-roles/{id}/apply:
 *   post:
 *     tags: [Job Roles]
 *     summary: Apply for a job role
 *     description: User or admin can apply for a job role. The authenticated user ID is extracted from the JWT token.
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
 *       409:
 *         description: Conflict - application may already exist
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
	'/:id/apply',
	requireAuth,
	allowRoles([USER_ROLES.ADMIN, USER_ROLES.USER]),
	validateParams(IdParamSchema),
	validateBody(CreateApplicationSchema),
	(req: R, res: Res) => {
		controller.createApplication(req, res);
	},
);



//future endpoint urls for url reference exclude /job-roles/
// jobRolesRouter.post('/job-roles/create', (req: R, res: Res) => {
// });

// jobRolesRouter.put('/job-roles/:id/update', (req: R, res: Res) => {
// });

// jobRolesRouter.delete('/job-roles/:id/delete', (req: R, res: Res) => {
// });

export default jobRolesRouter;
