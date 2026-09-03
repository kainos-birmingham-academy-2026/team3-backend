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
userApplicationsRouter.get("/", controller.getAll.bind(controller));
userApplicationsRouter.patch(
    "/:applicationId/withdraw",
    validateParams(ApplicationIdParamSchema),
    controller.withdraw.bind(controller),
);

export default userApplicationsRouter;