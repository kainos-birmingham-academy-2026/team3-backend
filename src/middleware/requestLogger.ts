import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (req, res, next) => {
	const startedAt = process.hrtime.bigint();

	res.once("finish", () => {
		const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

		console.info(
			JSON.stringify({
				event: "http_request",
				method: req.method,
				path: req.path,
				status: res.statusCode,
				durationMs: Number(durationMs.toFixed(2)),
			}),
		);
	});

	next();
};