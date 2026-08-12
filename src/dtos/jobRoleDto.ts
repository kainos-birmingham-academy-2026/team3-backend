import { z } from "zod";

export const IdParamSchema = z.object({
	id: z.coerce
		.number("ID must be a number")
		.int("ID must be an integer")
		.positive("ID must be a positive number"),
});

export type IdParamDto = z.infer<typeof IdParamSchema>;

export const CreateApplicationSchema = z.object({
	//user id validation is handled by the auth middleware, validation not required here
	//job role id validation is handled by the route param validation, validation not required here
	cvReference: z.string().trim().min(1, "CV reference cannot be empty"),
});

export type CreateApplicationRequestDto = z.infer<typeof CreateApplicationSchema>;