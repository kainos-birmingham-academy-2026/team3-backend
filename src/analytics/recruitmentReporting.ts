export type NormalisedRecruitmentStatus =
  | "IN_PROGRESS"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN"
  | "OPEN"
  | "CLOSED";

export interface VacancyDailySnapshot {
  snapshotDate: string;
  jobRoleId: number;
  capabilityId: number;
  bandId: number;
  locationId: number;
  statusName: string;
  numberOfOpenPositions: number;
}

export interface ApplicationFact {
  applicationId: number;
  jobRoleId: number;
  userKey: number;
  capabilityId: number;
  bandId: number;
  locationId: number;
  statusName: NormalisedRecruitmentStatus;
  submittedAt: string;
  statusUpdatedAt: string;
  isDeletedInSource: boolean;
}

export function normaliseRecruitmentStatus(
  status: string | null | undefined,
): NormalisedRecruitmentStatus {
  const value = (status ?? "IN_PROGRESS").trim().toUpperCase();

  switch (value) {
    case "OPEN":
      return "OPEN";
    case "CLOSED":
      return "CLOSED";
    case "IN_PROGRESS":
    case "PENDING":
      return "IN_PROGRESS";
    case "HIRED":
    case "APPROVED":
      return "HIRED";
    case "REJECTED":
      return "REJECTED";
    case "WITHDRAWN":
      return "WITHDRAWN";
    default:
      return "IN_PROGRESS";
  }
}

export function buildVacancyDailySnapshot({
  jobRoleId,
  capabilityId,
  bandId,
  locationId,
  statusName,
  numberOfOpenPositions,
  snapshotDate,
}: {
  jobRoleId: number;
  capabilityId: number;
  bandId: number;
  locationId: number;
  statusName: string | null | undefined;
  numberOfOpenPositions: number;
  snapshotDate: Date | string;
}): VacancyDailySnapshot {
  const snapshot =
    snapshotDate instanceof Date ? snapshotDate.toISOString() : snapshotDate;

  return {
    snapshotDate: snapshot.slice(0, 10),
    jobRoleId,
    capabilityId,
    bandId,
    locationId,
    statusName: normaliseRecruitmentStatus(statusName),
    numberOfOpenPositions,
  };
}

export function buildApplicationFact({
  applicationId,
  jobRoleId,
  userId,
  capabilityId,
  bandId,
  locationId,
  applicationStatus,
  createdAt,
  updatedAt,
  isDeletedInSource = false,
}: {
  applicationId: number;
  jobRoleId: number;
  userId: number;
  capabilityId: number;
  bandId: number;
  locationId: number;
  applicationStatus: string | null | undefined;
  createdAt: Date | string;
  updatedAt: Date | string;
  isDeletedInSource?: boolean;
}): ApplicationFact {
  const createdIso =
    createdAt instanceof Date ? createdAt.toISOString() : createdAt;
  const updatedIso =
    updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;

  return {
    applicationId,
    jobRoleId,
    userKey: userId,
    capabilityId,
    bandId,
    locationId,
    statusName: normaliseRecruitmentStatus(applicationStatus),
    submittedAt: createdIso,
    statusUpdatedAt: updatedIso,
    isDeletedInSource,
  };
}
