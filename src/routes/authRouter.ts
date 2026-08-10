import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { LoginSchema } from "../dtos/authDto.js";
import { validateBody } from "../middleware/validate";
import { AuthService } from "../services/authService.js";

const router = Router();
const controller = new AuthController(new AuthService());

router.post("/", validateBody(LoginSchema), controller.login.bind(controller));

export default router;
