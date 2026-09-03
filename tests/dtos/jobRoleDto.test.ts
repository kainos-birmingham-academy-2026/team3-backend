import { describe, expect, it } from "vitest";
import {
	CreateApplicationSchema,
	CreateJobRoleSchema,
	JobRoleFiltersSchema,
	JobRoleIdParamSchema,
} from "../../src/dtos/jobRoleDto.js";

describe("job role DTO schemas", () => {
	describe("JobRoleFiltersSchema", () => {
		it("should trim text and coerce single and repeated IDs", () => {
			const result = JobRoleFiltersSchema.safeParse({
				roleName: "  engineer  ",
				locationId: ["1", "2"],
				capabilityId: "3",
				bandId: "4",
				closingDateFrom: "2026-09-01",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					roleName: "engineer",
					locationId: [1, 2],
					capabilityId: [3],
					bandId: [4],
					closingDateFrom: "2026-09-01",
				});
			}
		});

		it.each([
			["a non-numeric ID", { locationId: "unknown" }],
			["a non-positive ID", { bandId: "0" }],
			["an invalid date", { closingDateFrom: "2026-02-30" }],
			[
				"both closing date filters",
				{ closingDateFrom: "2026-09-01", closingDateTo: "2026-12-31" },
			],
		])("should reject %s", (_name, filters) => {
			expect(JobRoleFiltersSchema.safeParse(filters).success).toBe(false);
		});
	});

	describe("JobRoleIdParamSchema", () => {
		it("should coerce a positive integer string to a number", () => {
			const result = JobRoleIdParamSchema.safeParse({ jobRoleId: "42" });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.jobRoleId).toBe(42);
			}
		});

		it.each([
			["zero", "0"],
			["negative", "-1"],
			["decimal", "1.5"],
			["non-numeric", "abc"],
		])("should reject a %s job role id", (_name, jobRoleId) => {
			expect(
				JobRoleIdParamSchema.safeParse({ jobRoleId }).success,
			).toBe(false);
		});
	});

	describe("CreateJobRoleSchema", () => {
		const validPayload = {
			roleName: "  Software Engineer  ",
			description: "  Build and maintain software systems  ",
			responsibilities: "  Code development, testing, deployment  ",
			sharepointUrl: "https://sharepoint.example.com/roles/1",
			numberOfOpenPositions: 2,
			closingDate: "2099-12-31T00:00:00.000Z",
			capabilityId: 1,
			bandId: 2,
			locationId: 3,
		};

		it("should trim strings and transform the date", () => {
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
			expect(
				CreateJobRoleSchema.safeParse({ ...validPayload, ...override }).success,
			).toBe(false);
		});
	});

	describe("CreateApplicationSchema", () => {
		it("should coerce a job role ID and trim a valid CV reference", () => {
			const result = CreateApplicationSchema.safeParse({
				jobRoleId: "3",
				cvText: "  CV-2026-001  ",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.jobRoleId).toBe(3);
				expect(result.data.cvText).toBe("CV-2026-001");
			}
		});

		it("should reject an empty CV reference", () => {
			expect(
				CreateApplicationSchema.safeParse({ jobRoleId: 3, cvText: "   " })
					.success,
			).toBe(false);
		});

		it("should reject a missing job role ID", () => {
			expect(
				CreateApplicationSchema.safeParse({ cvText: "CV-2026-001" }).success,
			).toBe(false);
		});
	});
});
