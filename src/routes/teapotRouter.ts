import { type Request as R, type Response as Res, Router } from "express";
import { TeapotError } from "../errors/teapotError.js";

const teapotRouter = Router();

/**
 * @openapi
 * /teapot:
 *   get:
 *     tags: [System]
 *     summary: I'm a teapot
 *     description: Returns a 418 I'm a teapot response. This is a fun endpoint that demonstrates the 418 HTTP status code.
 *     responses:
 *       418:
 *         description: I'm a teapot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "I'm a teapot"
 */
teapotRouter.get("/", (_req: R, res: Res) => {
	try {
		throw new TeapotError();
	} catch (error) {
		if (error instanceof TeapotError) {
			return res.status(error.statusCode).json({ message: error.message });
		}
		return res.status(500).json({ error: "Internal server error" });
	}
});

export default teapotRouter;
