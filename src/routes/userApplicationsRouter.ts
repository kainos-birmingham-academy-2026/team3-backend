import { Router } from "express";
import { z } from "zod";

import { UserApplicationsController } from "../controllers/userApplicationsController";
import { requireAuth } from "../middleware/requireAuth";
import { validateParams } from "../middleware/validate";
import { UserApplicationsService } from "../services/userApplicationsService";

const userApplicationsRouter = Router();
const controller = new UserApplicationsController(
    new UserApplicationsService(),
);
const ApplicationIdParamSchema = z.object({
    applicationId: z.coerce.number().int().positive(),
});

userApplicationsRouter.use(requireAuth);

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
userApplicationsRouter.patch(
    "/:applicationId/withdraw",
    validateParams(ApplicationIdParamSchema),
    controller.withdraw.bind(controller),
);

export default userApplicationsRouter;