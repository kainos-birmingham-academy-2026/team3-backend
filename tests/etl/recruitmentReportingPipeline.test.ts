import { describe, expect, it } from "vitest";
import {
  buildApplicationFactSet,
  buildVacancySnapshotRows,
} from "../../src/etl/recruitmentReportingJob.js";

describe("recruitment reporting ETL", () => {
  it("builds vacancy snapshot rows from job-role records", () => {
    const rows = buildVacancySnapshotRows([
      {
        jobRoleId: 1,
        capabilityId: 3,
        bandId: 4,
        locationId: 2,
        statusName: "OPEN",
        numberOfOpenPositions: 2,
      },
      {
        jobRoleId: 2,
        capabilityId: 5,
        bandId: 6,
        locationId: 7,
        statusName: "CLOSED",
        numberOfOpenPositions: 0,
      },
    ]);

    expect(rows).toEqual([
      {
        snapshotDate: expect.any(String),
        jobRoleId: 1,
        capabilityId: 3,
        bandId: 4,
        locationId: 2,
        statusName: "OPEN",
        numberOfOpenPositions: 2,
      },
      {
        snapshotDate: expect.any(String),
        jobRoleId: 2,
        capabilityId: 5,
        bandId: 6,
        locationId: 7,
        statusName: "CLOSED",
        numberOfOpenPositions: 0,
      },
    ]);
  });

  it("builds a current-state application fact set from source rows", () => {
    const rows = buildApplicationFactSet([
      {
        applicationId: 11,
        jobRoleId: 1,
        userId: 99,
        capabilityId: 3,
        bandId: 4,
        locationId: 2,
        applicationStatus: "REJECTED",
        createdAt: "2026-09-10T09:00:00.000Z",
        updatedAt: "2026-09-12T10:00:00.000Z",
      },
    ]);

    expect(rows).toEqual([
      {
        applicationId: 11,
        jobRoleId: 1,
        userKey: 99,
        capabilityId: 3,
        bandId: 4,
        locationId: 2,
        statusName: "REJECTED",
        submittedAt: "2026-09-10T09:00:00.000Z",
        statusUpdatedAt: "2026-09-12T10:00:00.000Z",
        isDeletedInSource: false,
      },
    ]);
  });
});
