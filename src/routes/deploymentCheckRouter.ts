import { Router } from "express";

const deploymentCheckRouter = Router();

deploymentCheckRouter.get("/", (_req, res) => {
	res.json({
		service: "team3-backend",
		marker: "chore-test-branch-one-backend",
		message: "Selected backend feature image is running",
	});
});

export default deploymentCheckRouter;
