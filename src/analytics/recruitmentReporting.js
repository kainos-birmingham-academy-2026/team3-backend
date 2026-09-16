"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normaliseRecruitmentStatus = normaliseRecruitmentStatus;
exports.buildVacancyDailySnapshot = buildVacancyDailySnapshot;
exports.buildApplicationFact = buildApplicationFact;
function normaliseRecruitmentStatus(status) {
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
function buildVacancyDailySnapshot({ jobRoleId, capabilityId, bandId, locationId, statusName, numberOfOpenPositions, snapshotDate, }) {
    const snapshot = snapshotDate instanceof Date ? snapshotDate.toISOString() : snapshotDate;
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
function buildApplicationFact({ applicationId, jobRoleId, userId, capabilityId, bandId, locationId, applicationStatus, createdAt, updatedAt, isDeletedInSource = false, }) {
    const createdIso = createdAt instanceof Date ? createdAt.toISOString() : createdAt;
    const updatedIso = updatedAt instanceof Date ? updatedAt.toISOString() : updatedAt;
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
