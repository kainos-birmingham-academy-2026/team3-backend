import { z } from "zod";

export const IdParamSchema = z.object({
	id: z.coerce
		.number("ID must be a number")
		.int("ID must be an integer")
		.positive("ID must be a positive number"),
});

export const CreateJobRoleSchema = z.object({
	roleName: z.string().trim().min(1, "Role name is required"),
	description: z.string().trim().min(1, "Description is required"),
	responsibilities: z.string().trim().min(1, "Responsibilities are required"),
	sharepointUrl: z.url("SharePoint URL must be a valid URL"),
	numberOfOpenPositions: z.coerce
		.number("Number of open positions must be a number")
		.int("Number of open positions must be an integer")
		.min(1, "Number of open positions must be at least 1"),
	closingDate: z.coerce.date().optional(),
	capabilityId: z.coerce
		.number("Capability ID must be a number")
		.int("Capability ID must be an integer")
		.positive("Capability ID must be a positive number"),
	bandId: z.coerce
		.number("Band ID must be a number")
		.int("Band ID must be an integer")
		.positive("Band ID must be a positive number"),
	locationId: z.coerce
		.number("Location ID must be a number")
		.int("Location ID must be an integer")
		.positive("Location ID must be a positive number"),
});

export type IdParamDto = z.infer<typeof IdParamSchema>;

export const CreateApplicationSchema = z.object({
	//user id validation is handled by the auth middleware, validation not required here
	//job role id validation is handled by the route param validation, validation not required here
	cvText: z.string().trim().min(1, "CV reference cannot be empty"),
});

export type CreateApplicationRequestDto = z.infer<typeof CreateApplicationSchema>;
export type CreateJobRoleRequestDto = z.infer<typeof CreateJobRoleSchema>;
