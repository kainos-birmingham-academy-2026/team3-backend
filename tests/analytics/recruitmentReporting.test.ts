import { describe, expect, it } from "vitest";
import {
	buildApplicationFact,
	buildVacancyDailySnapshot,
	normaliseRecruitmentStatus,
} from "../../src/analytics/recruitmentReporting.js";

describe("recruitment reporting helpers", () => {
	it("normalises status values for reporting", () => {
		expect(normaliseRecruitmentStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
		expect(normaliseRecruitmentStatus("PENDING")).toBe("IN_PROGRESS");
		expect(normaliseRecruitmentStatus("APPROVED")).toBe("HIRED");
		expect(normaliseRecruitmentStatus("WITHDRAWN")).toBe("WITHDRAWN");
		expect(normaliseRecruitmentStatus(undefined)).toBe("IN_PROGRESS");
	});

	it("builds a daily vacancy snapshot row with a point-in-time count", () => {
		const snapshot = buildVacancyDailySnapshot({
			jobRoleId: 42,
			capabilityId: 3,
			bandId: 4,
			locationId: 2,
			statusName: "OPEN",
			numberOfOpenPositions: 3,
			snapshotDate: "2026-09-15T09:00:00.000Z",
		});

		expect(snapshot).toEqual({
			snapshotDate: "2026-09-15",
			jobRoleId: 42,
			capabilityId: 3,
			bandId: 4,
			locationId: 2,
			statusName: "OPEN",
			numberOfOpenPositions: 3,
		});
	});

	it("builds a current-state application fact from the OLTP row", () => {
		const fact = buildApplicationFact({
			applicationId: 11,
			jobRoleId: 42,
			userId: 99,
			capabilityId: 3,
			bandId: 4,
			locationId: 2,
			applicationStatus: "WITHDRAWN",
			createdAt: "2026-09-10T09:00:00.000Z",
			updatedAt: "2026-09-12T10:00:00.000Z",
		});

		expect(fact).toEqual({
			applicationId: 11,
			jobRoleId: 42,
			userKey: 99,
			capabilityId: 3,
			bandId: 4,
			locationId: 2,
			statusName: "WITHDRAWN",
			submittedAt: "2026-09-10T09:00:00.000Z",
			statusUpdatedAt: "2026-09-12T10:00:00.000Z",
			isDeletedInSource: false,
		});
	});
});
