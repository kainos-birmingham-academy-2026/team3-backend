import { Router } from "express";
import { JobRoleChatController } from "../controllers/jobRoleChatController.js";
import { JobRoleChatSchema } from "../dtos/jobRoleChatDto.js";
import { validateBody } from "../middleware/validate.js";
import { AzureOpenAIService } from "../services/azureOpenAIService.js";
import { JobRoleChatService } from "../services/jobRoleChatService.js";
import { JobRolesService } from "../services/jobRolesService.js";

const jobRoleChatRouter = Router();
const controller = new JobRoleChatController(
	new JobRoleChatService(new JobRolesService(), new AzureOpenAIService()),
);

jobRoleChatRouter.post("/", validateBody(JobRoleChatSchema), (req, res) =>
	controller.answer(req, res),
);

export default jobRoleChatRouter;
