import {
  buildApplicationFact,
  buildVacancyDailySnapshot,
  type ApplicationFact,
  type VacancyDailySnapshot,
} from "../analytics/recruitmentReporting.js";

export interface SourceJobRoleSnapshot {
  jobRoleId: number;
  capabilityId: number;
  bandId: number;
  locationId: number;
  statusName: string | null | undefined;
  numberOfOpenPositions: number;
}

export interface SourceApplicationRow {
  applicationId: number;
  jobRoleId: number;
  userId: number;
  capabilityId: number;
  bandId: number;
  locationId: number;
  applicationStatus: string | null | undefined;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export function buildVacancySnapshotRows(
  rows: SourceJobRoleSnapshot[],
  snapshotDate: Date = new Date(),
): VacancyDailySnapshot[] {
  return rows.map((row) =>
    buildVacancyDailySnapshot({
      snapshotDate,
      jobRoleId: row.jobRoleId,
      capabilityId: row.capabilityId,
      bandId: row.bandId,
      locationId: row.locationId,
      statusName: row.statusName,
      numberOfOpenPositions: row.numberOfOpenPositions,
    }),
  );
}

export function buildApplicationFactSet(
  rows: SourceApplicationRow[],
): ApplicationFact[] {
  return rows.map((row) =>
    buildApplicationFact({
      applicationId: row.applicationId,
      jobRoleId: row.jobRoleId,
      userId: row.userId,
      capabilityId: row.capabilityId,
      bandId: row.bandId,
      locationId: row.locationId,
      applicationStatus: row.applicationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isDeletedInSource: false,
    }),
  );
}
