import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecruitmentReportingJob } from "../../src/etl/recruitmentReportingJob.ts";

describe("RecruitmentReportingJob", () => {
	let job: RecruitmentReportingJob;
	let mockExec: ReturnType<typeof vi.fn>;
	let mockJobRoleFindMany: ReturnType<typeof vi.fn>;
	let mockApplicationFindMany: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockExec = vi.fn().mockResolvedValue(undefined);
		mockJobRoleFindMany = vi.fn().mockResolvedValue([
			{
				jobRoleId: 1,
				capabilityId: 3,
				capability: { capabilityName: "Software Engineering" },
				bandId: 4,
				band: { bandName: "Engineer", bandLevel: 7 },
				locationId: 2,
				location: { locationName: "Birmingham" },
				status: { statusName: "OPEN" },
				numberOfOpenPositions: 2,
			},
		]);
		mockApplicationFindMany = vi.fn().mockResolvedValue([
			{
				applicationId: 11,
				jobRoleId: 1,
				userId: 99,
				jobRole: {
					capabilityId: 3,
					bandId: 4,
					locationId: 2,
				},
				applicationStatus: "REJECTED",
				createdAt: new Date("2026-09-10T09:00:00.000Z"),
				updatedAt: new Date("2026-09-12T10:00:00.000Z"),
			},
		]);

		job = new RecruitmentReportingJob({
			jobRole: { findMany: mockJobRoleFindMany },
			application: { findMany: mockApplicationFindMany },
			$executeRawUnsafe: mockExec,
		} as never);
	});

	it("extracts job roles and applications, then writes reporting rows", async () => {
		const result = await job.run(new Date("2026-09-15T00:00:00.000Z"));

		expect(mockJobRoleFindMany).toHaveBeenCalledTimes(1);
		expect(mockApplicationFindMany).toHaveBeenCalledTimes(1);
		expect(result.vacancyRows).toHaveLength(1);
		expect(result.applicationRows).toHaveLength(1);
		expect(result.vacancyRows[0]).toMatchObject({
			jobRoleId: 1,
			statusName: "OPEN",
			numberOfOpenPositions: 2,
		});
		expect(result.applicationRows[0]).toMatchObject({
			applicationId: 11,
			statusName: "REJECTED",
			userKey: 99,
		});
		expect(mockExec).toHaveBeenCalledWith(
			expect.stringContaining("reporting.dim_capability"),
			3,
			"Software Engineering",
		);
		expect(mockExec).toHaveBeenCalledWith(
			expect.stringContaining("reporting.dim_band"),
			4,
			"Engineer",
			7,
		);
		expect(mockExec).toHaveBeenCalledWith(
			expect.stringContaining("reporting.dim_location"),
			2,
			"Birmingham",
		);
		expect(mockExec).toHaveBeenCalledWith(
			expect.stringContaining("VALUES ($1::DATE, $2"),
			"2026-09-15",
			1,
			3,
			4,
			2,
			"OPEN",
			2,
		);
		expect(mockExec).toHaveBeenCalledWith(
			expect.stringContaining("$8::TIMESTAMPTZ, $9::TIMESTAMPTZ"),
			11,
			1,
			99,
			3,
			4,
			2,
			"REJECTED",
			"2026-09-10T09:00:00.000Z",
			"2026-09-12T10:00:00.000Z",
			false,
		);
		expect(mockExec).toHaveBeenCalledWith(
			expect.stringContaining("$4::DATE"),
			new Date("2026-09-15T00:00:00.000Z"),
			1,
			1,
			"2026-09-15",
		);
		expect(mockExec).toHaveBeenCalledTimes(6);
	});
});
