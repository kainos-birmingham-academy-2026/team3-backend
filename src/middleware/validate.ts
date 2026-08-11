import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

const formatErrors = (
	issues: Array<{ path: PropertyKey[]; message: string }>,
) => {
	return issues.map((issue) => ({
		field: issue.path.join("."),
		message: issue.message,
	}));
};

export const validateBody = <T>(schema: ZodSchema<T>): RequestHandler => {
	return (req, res, next) => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			return res
				.status(400)
				.json({ errors: formatErrors(result.error.issues) });
		}

		req.body = result.data;
		next();
	};
};

export const validateParams = <T>(schema: ZodSchema<T>): RequestHandler => {
	return (req, res, next) => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			return res
				.status(400)
				.json({ errors: formatErrors(result.error.issues) });
		}

		req.params = result.data as typeof req.params;
		next();
	};
};
