import type { RequestHandler } from "express";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;
const requestsByIp = new Map<string, number[]>();

export const chatRateLimit: RequestHandler = (req, res, next) => {
	const now = Date.now();
	const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
	const recentRequests = (requestsByIp.get(ip) ?? []).filter(
		(timestamp) => now - timestamp < WINDOW_MS,
	);

	if (recentRequests.length >= MAX_REQUESTS) {
		res.setHeader("Retry-After", Math.ceil(WINDOW_MS / 1000));
		res.status(429).json({
			message: "Too many chat requests. Please try again later.",
		});
		return;
	}

	recentRequests.push(now);
	requestsByIp.set(ip, recentRequests);
	next();
};