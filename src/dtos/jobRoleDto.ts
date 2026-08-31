import { z } from "zod";

const optionalIdList = z.preprocess(
	(value) =>
		value === undefined ? undefined : Array.isArray(value) ? value : [value],
	z.array(z.coerce.number().int().positive()).min(1).optional(),
);

const optionalFilterDate = z.preprocess(
	(value) => (value === "" ? undefined : value),
	z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Closing date must use YYYY-MM-DD")
		.refine((value) => {
			const date = new Date(`${value}T00:00:00.000Z`);
			return (
				!Number.isNaN(date.getTime()) &&
				date.toISOString().slice(0, 10) === value
			);
		}, "Closing date must be a valid date")
		.optional(),
);

export const JobRoleFiltersSchema = z
	.object({
		roleName: z.preprocess(
			(value) => (value === "" ? undefined : value),
			z.string().trim().max(100).optional(),
		),
		locationId: optionalIdList,
		capabilityId: optionalIdList,
		bandId: optionalIdList,
		closingFrom: optionalFilterDate,
		closingBy: optionalFilterDate,
	})
	.refine(
		(filters) =>
			!filters.closingFrom ||
			!filters.closingBy ||
			filters.closingFrom <= filters.closingBy,
		{
			message: "Closing from must be on or before closing by",
			path: ["closingBy"],
		},
	);

export const IdParamSchema = z.object({
	id: z.coerce
		.number("ID must be a number")
		.int("ID must be an integer")
		.positive("ID must be a positive number"),
});

export const CreateJobRoleSchema = z.object({
	roleName: z
		.string()
		.trim()
		.min(1, "Role name is required")
		.max(100, "Role name must be 100 characters or fewer"),
	description: z.string().trim().min(1, "Description is required"),
	responsibilities: z.string().trim().min(1, "Responsibilities are required"),
	sharepointUrl: z
		.url("SharePoint URL must be a valid URL")
		.max(255, "SharePoint URL must be 255 characters or fewer"),
	numberOfOpenPositions: z.coerce
		.number("Number of open positions must be a number")
		.int("Number of open positions must be an integer")
		.min(1, "Number of open positions must be at least 1"),
	closingDate: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z
			.string()
			.refine((val) => !Number.isNaN(Date.parse(val)), {
				message: "Closing date must be a valid date (e.g. ISO 8601 format)",
			})
			.transform((val) => new Date(val))
			.refine((date) => date >= new Date(), {
				message: "Closing date cannot be in the past",
			})
			.optional(),
	),
	capabilityId: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.coerce
			.number({
				message: "Capability cannot be blank",
			})
			.int()
			.positive(),
	),
	bandId: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.coerce
			.number({
				message: "Band cannot be blank",
			})
			.int()
			.positive(),
	),
	locationId: z.preprocess(
		(value) => (value === "" ? undefined : value),
		z.coerce
			.number({
				error: "Location cannot be blank",
			})
			.int("Location ID must be an integer")
			.positive("Location ID must be a positive number"),
	),
});

export const UpdateJobRoleSchema = CreateJobRoleSchema;

export type IdParamDto = z.infer<typeof IdParamSchema>;
export type JobRoleFiltersDto = z.infer<typeof JobRoleFiltersSchema>;

export const CreateApplicationSchema = z.object({
	//user id validation is handled by the auth middleware, validation not required here
	//job role id validation is handled by the route param validation, validation not required here
	cvText: z.string().trim().min(1, "CV reference cannot be empty"),
});

export type CreateApplicationRequestDto = z.infer<
	typeof CreateApplicationSchema
>;
export type CreateJobRoleRequestDto = z.infer<typeof CreateJobRoleSchema>;
export type UpdateJobRoleRequestDto = z.infer<typeof UpdateJobRoleSchema>;
