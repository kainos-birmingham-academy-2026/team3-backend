import { describe, expect, it } from "vitest";
import {
	CreateApplicationSchema,
	CreateJobRoleSchema,
	IdParamSchema,
} from "../../src/dtos/jobRoleDto.js";

describe("job role DTO schemas", () => {
	describe("IdParamSchema", () => {
		it("should coerce a positive integer string to a number", () => {
			const result = IdParamSchema.safeParse({ id: "42" });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe(42);
			}
		});

		it.each([
			["zero", "0"],
			["negative", "-1"],
			["decimal", "1.5"],
			["non-numeric", "abc"],
		])("should reject a %s id", (_name, id) => {
			expect(IdParamSchema.safeParse({ id }).success).toBe(false);
		});
	});

	describe("CreateJobRoleSchema", () => {
		const validPayload = {
			roleName: "  Software Engineer  ",
			description: "  Build and maintain software systems  ",
			responsibilities: "  Code development, testing, deployment  ",
			sharepointUrl: "https://sharepoint.example.com/roles/1",
			numberOfOpenPositions: "2",
			closingDate: "2099-12-31T00:00:00.000Z",
			capabilityId: "1",
			bandId: "2",
			locationId: "3",
		};

		it("should trim strings, coerce ids and numbers, and transform the date", () => {
			const result = CreateJobRoleSchema.safeParse(validPayload);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					roleName: "Software Engineer",
					description: "Build and maintain software systems",
					responsibilities: "Code development, testing, deployment",
					sharepointUrl: validPayload.sharepointUrl,
					numberOfOpenPositions: 2,
					closingDate: new Date(validPayload.closingDate),
					capabilityId: 1,
					bandId: 2,
					locationId: 3,
				});
			}
		});

		it("should allow an omitted closing date", () => {
			const { closingDate: _closingDate, ...payloadWithoutDate } = validPayload;

			const result = CreateJobRoleSchema.safeParse(payloadWithoutDate);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.closingDate).toBeUndefined();
			}
		});

		it.each([
			["an empty role name", { roleName: "" }],
			["an invalid URL", { sharepointUrl: "not-a-url" }],
			["zero open positions", { numberOfOpenPositions: 0 }],
			["an invalid closing date", { closingDate: "not-a-date" }],
			["a past closing date", { closingDate: "2020-01-01T00:00:00.000Z" }],
		])("should reject %s", (_name, override) => {
			expect(CreateJobRoleSchema.safeParse({ ...validPayload, ...override }).success).toBe(false);
		});
	});

	describe("CreateApplicationSchema", () => {
		it("should trim a valid CV reference", () => {
			const result = CreateApplicationSchema.safeParse({ cvText: "  CV-2026-001  " });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.cvText).toBe("CV-2026-001");
			}
		});

		it("should reject an empty CV reference", () => {
			expect(CreateApplicationSchema.safeParse({ cvText: "   " }).success).toBe(false);
		});
	});
});