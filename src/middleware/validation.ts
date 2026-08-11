import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

const formatErrors = (
	issues: Array<{ path: PropertyKey[]; message: string }>,
) => {
	return issues.map((issue) => ({
		field: issue.path.join("."),
        //field not required in the response, but useful for debugging
		message: issue.message,
	}));
};


export const validateParams = <T>(schema: ZodSchema<T>): RequestHandler => {
	return (req, res, next) => {
		const result = schema.safeParse(req.params);

		if (!result.success) {
			return res
				.status(400)
				.json({ errors: formatErrors(result.error.issues) });
		}
		next();
	};
};