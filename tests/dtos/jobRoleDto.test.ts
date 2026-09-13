import { describe, expect, it, vi } from "vitest";
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
					page: 1,
					pageSize: 10,
				});
			}
		});

		it("should coerce pagination values", () => {
			const result = JobRoleFiltersSchema.safeParse({
				page: "2",
				pageSize: "25",
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toMatchObject({ page: 2, pageSize: 25 });
			}
		});

		it.each([
			["a non-numeric ID", { locationId: "unknown" }],
			["a non-positive ID", { bandId: "0" }],
			["an invalid date", { closingDateFrom: "2026-02-30" }],
			["a non-positive page", { page: "0" }],
			["an excessive page size", { pageSize: "101" }],
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
			expect(JobRoleIdParamSchema.safeParse({ jobRoleId }).success).toBe(false);
		});
	});

	describe("CreateJobRoleSchema", () => {
		const validPayload = {
			roleName: "  Software Engineer  ",
			description: "  Build and maintain software systems  ",
			responsibilities: "  Code development, testing, deployment  ",
			sharepointUrl: "https://sharepoint.example.com/roles/1",
			numberOfOpenPositions: 2,
			openingDate: "2099-01-01T00:00:00.000Z",
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
					openingDate: new Date(validPayload.openingDate),
					closingDate: new Date(validPayload.closingDate),
					capabilityId: 1,
					bandId: 2,
					locationId: 3,
				});
			}
		});

		it("should allow omitted opening and closing dates", () => {
			const {
				openingDate: _openingDate,
				closingDate: _closingDate,
				...payloadWithoutDates
			} = validPayload;

			const result = CreateJobRoleSchema.safeParse(payloadWithoutDates);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.openingDate).toBeUndefined();
				expect(result.data.closingDate).toBeUndefined();
			}
		});

		it.each([
			["immediately before midnight", "2026-09-13T23:59:59.999Z", "2026-09-13"],
			["immediately after midnight", "2026-09-14T00:00:00.001Z", "2026-09-14"],
		])("should allow today as the opening date %s", (_label, now, openingDate) => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date(now));

			const result = CreateJobRoleSchema.safeParse({
				...validPayload,
				openingDate,
			});

			expect(result.success).toBe(true);
			vi.useRealTimers();
		});

		it.each([
			["an empty role name", { roleName: "" }],
			["a description over 2000 characters", { description: "a".repeat(2001) }],
			[
				"responsibilities over 2000 characters",
				{ responsibilities: "a".repeat(2001) },
			],
			["an invalid URL", { sharepointUrl: "not-a-url" }],
			["zero open positions", { numberOfOpenPositions: 0 }],
			["an invalid opening date", { openingDate: "not-a-date" }],
			["a past opening date", { openingDate: "2020-01-01T00:00:00.000Z" }],
			[
				"an opening date after the closing date",
				{ openingDate: "2100-01-01T00:00:00.000Z" },
			],
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
