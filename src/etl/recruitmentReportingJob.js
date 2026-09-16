"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecruitmentReportingJob = void 0;
exports.buildVacancySnapshotRows = buildVacancySnapshotRows;
exports.buildApplicationFactSet = buildApplicationFactSet;
const recruitmentReporting_js_1 = require("../analytics/recruitmentReporting.js");
function buildVacancySnapshotRows(rows, snapshotDate = new Date()) {
    return rows.map((row) => (0, recruitmentReporting_js_1.buildVacancyDailySnapshot)({
        snapshotDate,
        jobRoleId: row.jobRoleId,
        capabilityId: row.capabilityId,
        bandId: row.bandId,
        locationId: row.locationId,
        statusName: row.statusName,
        numberOfOpenPositions: row.numberOfOpenPositions,
    }));
}
function buildApplicationFactSet(rows) {
    return rows.map((row) => (0, recruitmentReporting_js_1.buildApplicationFact)({
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
    }));
}
class RecruitmentReportingJob {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async run(snapshotDate = new Date()) {
        const jobRoles = (await this.prisma.jobRole.findMany({
            include: {
                capability: true,
                band: true,
                location: true,
                status: true,
            },
        }));
        const applications = (await this.prisma.application.findMany({
            include: {
                jobRole: true,
            },
        }));
        const vacancyRows = buildVacancySnapshotRows(jobRoles.map((jobRole) => ({
            jobRoleId: jobRole.jobRoleId,
            capabilityId: jobRole.capabilityId,
            bandId: jobRole.bandId,
            locationId: jobRole.locationId,
            statusName: jobRole.status?.statusName ?? jobRole.statusName,
            numberOfOpenPositions: jobRole.numberOfOpenPositions,
        })), snapshotDate);
        const applicationRows = buildApplicationFactSet(applications.map((application) => ({
            applicationId: application.applicationId,
            jobRoleId: application.jobRoleId,
            userId: application.userId,
            capabilityId: application.jobRole?.capabilityId ?? application.jobRoleId,
            bandId: application.jobRole?.bandId ?? application.jobRoleId,
            locationId: application.jobRole?.locationId ?? application.jobRoleId,
            applicationStatus: application.applicationStatus,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
        })));
        await this.writeDimensionData();
        await this.writeVacancySnapshots(vacancyRows);
        await this.writeApplicationFacts(applicationRows);
        await this.writeRunLog(snapshotDate, vacancyRows.length, applicationRows.length);
        return { vacancyRows, applicationRows };
    }
    async writeDimensionData() {
        await this.prisma.$executeRawUnsafe("INSERT INTO reporting.dim_capability (capability_id, capability_name) VALUES (1, 'Software Engineering') ON CONFLICT (capability_id) DO NOTHING;");
        await this.prisma.$executeRawUnsafe("INSERT INTO reporting.dim_band (band_id, band_name, band_level) VALUES (1, 'Engineer', 7) ON CONFLICT (band_id) DO NOTHING;");
        await this.prisma.$executeRawUnsafe("INSERT INTO reporting.dim_location (location_id, location_name) VALUES (1, 'Birmingham') ON CONFLICT (location_id) DO NOTHING;");
    }
    async writeVacancySnapshots(rows) {
        for (const row of rows) {
            await this.prisma.$executeRawUnsafe("INSERT INTO reporting.fact_vacancy_daily (snapshot_date, job_role_id, capability_id, band_id, location_id, status_name, number_of_open_positions) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (snapshot_date, job_role_id) DO UPDATE SET capability_id = EXCLUDED.capability_id, band_id = EXCLUDED.band_id, location_id = EXCLUDED.location_id, status_name = EXCLUDED.status_name, number_of_open_positions = EXCLUDED.number_of_open_positions;", row.snapshotDate, row.jobRoleId, row.capabilityId, row.bandId, row.locationId, row.statusName, row.numberOfOpenPositions);
        }
    }
    async writeApplicationFacts(rows) {
        for (const row of rows) {
            await this.prisma.$executeRawUnsafe("INSERT INTO reporting.fact_application (application_id, job_role_id, user_key, capability_id, band_id, location_id, status_name, submitted_at, status_updated_at, is_deleted_in_source, source_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) ON CONFLICT (application_id) DO UPDATE SET job_role_id = EXCLUDED.job_role_id, user_key = EXCLUDED.user_key, capability_id = EXCLUDED.capability_id, band_id = EXCLUDED.band_id, location_id = EXCLUDED.location_id, status_name = EXCLUDED.status_name, submitted_at = EXCLUDED.submitted_at, status_updated_at = EXCLUDED.status_updated_at, is_deleted_in_source = EXCLUDED.is_deleted_in_source, source_updated_at = NOW();", row.applicationId, row.jobRoleId, row.userKey, row.capabilityId, row.bandId, row.locationId, row.statusName, row.submittedAt, row.statusUpdatedAt, row.isDeletedInSource);
        }
    }
    async writeRunLog(snapshotDate, vacancyCount, applicationCount) {
        await this.prisma.$executeRawUnsafe("INSERT INTO reporting.etl_run_log (run_started_at, run_completed_at, status, rows_processed, last_snapshot_date) VALUES ($1, NOW(), 'SUCCESS', $2 + $3, $4);", snapshotDate, vacancyCount, applicationCount, snapshotDate.toISOString().slice(0, 10));
    }
}
exports.RecruitmentReportingJob = RecruitmentReportingJob;
