import { Router } from "express";
import { AuthController } from "../controllers/authController.js";
import { LoginSchema } from "../dtos/authDto.js";
import { validateBody } from "../middleware/validate";
import { AuthService } from "../services/authService.js";

const router = Router();
const controller = new AuthController(new AuthService());

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT
 *     description: Public endpoint. Swagger Authorize button is enabled globally but not required for this route.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Request validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: Invalid credentials
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

router.post("/", validateBody(LoginSchema), controller.login.bind(controller));

export default router;
