import { rateLimit } from "express-rate-limit";

const commonOptions = {
	standardHeaders: "draft-7" as const,
	legacyHeaders: false,
	message: { message: "Too many requests. Please try again later." },
};

export const registrationRateLimit = rateLimit({
	...commonOptions,
	windowMs: 15 * 60 * 1000,
	limit: 10,
});

export const verificationRateLimit = rateLimit({
	...commonOptions,
	windowMs: 10 * 60 * 1000,
	limit: 20,
});

export const resendVerificationRateLimit = rateLimit({
	...commonOptions,
	windowMs: 60 * 60 * 1000,
	limit: 5,
});