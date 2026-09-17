import {
	type ApplicationFact,
	buildApplicationFact,
	buildVacancyDailySnapshot,
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

export interface RecruitmentReportingJobDependencies {
	jobRole: {
		findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
	};
	application: {
		findMany: (args?: Record<string, unknown>) => Promise<unknown[]>;
	};
	$executeRawUnsafe: (sql: string, ...args: unknown[]) => Promise<unknown>;
}

export class RecruitmentReportingJob {
	private readonly prisma: RecruitmentReportingJobDependencies;

	constructor(prisma: RecruitmentReportingJobDependencies) {
		this.prisma = prisma;
	}

	async run(snapshotDate: Date = new Date()): Promise<{
		vacancyRows: VacancyDailySnapshot[];
		applicationRows: ApplicationFact[];
	}> {
		const jobRoles = (await this.prisma.jobRole.findMany({
			include: {
				capability: true,
				band: true,
				location: true,
				status: true,
			},
		})) as Array<{
			jobRoleId: number;
			capabilityId: number;
			capability?: { capabilityName?: string };
			bandId: number;
			band?: { bandName?: string; bandLevel?: number };
			locationId: number;
			location?: { locationName?: string };
			status?: { statusName?: string };
			numberOfOpenPositions: number;
			statusName?: string;
		}>;

		const applications = (await this.prisma.application.findMany({
			include: {
				jobRole: true,
			},
		})) as Array<{
			applicationId: number;
			jobRoleId: number;
			userId: number;
			jobRole: { capabilityId: number; bandId: number; locationId: number };
			applicationStatus?: string | null;
			createdAt: Date | string;
			updatedAt: Date | string;
		}>;

		const vacancyRows = buildVacancySnapshotRows(
			jobRoles.map((jobRole) => ({
				jobRoleId: jobRole.jobRoleId,
				capabilityId: jobRole.capabilityId,
				bandId: jobRole.bandId,
				locationId: jobRole.locationId,
				statusName: jobRole.status?.statusName ?? jobRole.statusName,
				numberOfOpenPositions: jobRole.numberOfOpenPositions,
			})),
			snapshotDate,
		);

		const applicationRows = buildApplicationFactSet(
			applications.map((application) => ({
				applicationId: application.applicationId,
				jobRoleId: application.jobRoleId,
				userId: application.userId,
				capabilityId: application.jobRole.capabilityId,
				bandId: application.jobRole.bandId,
				locationId: application.jobRole.locationId,
				applicationStatus: application.applicationStatus,
				createdAt: application.createdAt,
				updatedAt: application.updatedAt,
			})),
		);

		await this.writeDimensionData(jobRoles);
		await this.writeVacancySnapshots(vacancyRows);
		await this.writeApplicationFacts(applicationRows);
		await this.writeRunLog(
			snapshotDate,
			vacancyRows.length,
			applicationRows.length,
		);

		return { vacancyRows, applicationRows };
	}

	private async writeDimensionData(
		jobRoles: Array<{
			capabilityId: number;
			capability?: { capabilityName?: string };
			bandId: number;
			band?: { bandName?: string; bandLevel?: number };
			locationId: number;
			location?: { locationName?: string };
		}>,
	): Promise<void> {
		const capabilities = new Map<number, string>();
		const bands = new Map<number, { name: string; level: number }>();
		const locations = new Map<number, string>();

		for (const jobRole of jobRoles) {
			if (jobRole.capability?.capabilityName) {
				capabilities.set(
					jobRole.capabilityId,
					jobRole.capability.capabilityName,
				);
			}
			if (jobRole.band?.bandName && jobRole.band.bandLevel !== undefined) {
				bands.set(jobRole.bandId, {
					name: jobRole.band.bandName,
					level: jobRole.band.bandLevel,
				});
			}
			if (jobRole.location?.locationName) {
				locations.set(jobRole.locationId, jobRole.location.locationName);
			}
		}

		for (const [capabilityId, capabilityName] of capabilities) {
			await this.prisma.$executeRawUnsafe(
				"INSERT INTO reporting.dim_capability (capability_id, capability_name) VALUES ($1, $2) ON CONFLICT (capability_id) DO UPDATE SET capability_name = EXCLUDED.capability_name, updated_at = CURRENT_TIMESTAMP;",
				capabilityId,
				capabilityName,
			);
		}

		for (const [bandId, band] of bands) {
			await this.prisma.$executeRawUnsafe(
				"INSERT INTO reporting.dim_band (band_id, band_name, band_level) VALUES ($1, $2, $3) ON CONFLICT (band_id) DO UPDATE SET band_name = EXCLUDED.band_name, band_level = EXCLUDED.band_level, updated_at = CURRENT_TIMESTAMP;",
				bandId,
				band.name,
				band.level,
			);
		}

		for (const [locationId, locationName] of locations) {
			await this.prisma.$executeRawUnsafe(
				"INSERT INTO reporting.dim_location (location_id, location_name) VALUES ($1, $2) ON CONFLICT (location_id) DO UPDATE SET location_name = EXCLUDED.location_name, updated_at = CURRENT_TIMESTAMP;",
				locationId,
				locationName,
			);
		}
	}

	private async writeVacancySnapshots(
		rows: VacancyDailySnapshot[],
	): Promise<void> {
		for (const row of rows) {
			await this.prisma.$executeRawUnsafe(
				"INSERT INTO reporting.fact_vacancy_daily (snapshot_date, job_role_id, capability_id, band_id, location_id, status_name, number_of_open_positions) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (snapshot_date, job_role_id) DO UPDATE SET capability_id = EXCLUDED.capability_id, band_id = EXCLUDED.band_id, location_id = EXCLUDED.location_id, status_name = EXCLUDED.status_name, number_of_open_positions = EXCLUDED.number_of_open_positions;",
				row.snapshotDate,
				row.jobRoleId,
				row.capabilityId,
				row.bandId,
				row.locationId,
				row.statusName,
				row.numberOfOpenPositions,
			);
		}
	}

	private async writeApplicationFacts(rows: ApplicationFact[]): Promise<void> {
		for (const row of rows) {
			await this.prisma.$executeRawUnsafe(
				"INSERT INTO reporting.fact_application (application_id, job_role_id, user_key, capability_id, band_id, location_id, status_name, submitted_at, status_updated_at, is_deleted_in_source, source_updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) ON CONFLICT (application_id) DO UPDATE SET job_role_id = EXCLUDED.job_role_id, user_key = EXCLUDED.user_key, capability_id = EXCLUDED.capability_id, band_id = EXCLUDED.band_id, location_id = EXCLUDED.location_id, status_name = EXCLUDED.status_name, submitted_at = EXCLUDED.submitted_at, status_updated_at = EXCLUDED.status_updated_at, is_deleted_in_source = EXCLUDED.is_deleted_in_source, source_updated_at = NOW();",
				row.applicationId,
				row.jobRoleId,
				row.userKey,
				row.capabilityId,
				row.bandId,
				row.locationId,
				row.statusName,
				row.submittedAt,
				row.statusUpdatedAt,
				row.isDeletedInSource,
			);
		}
	}

	private async writeRunLog(
		snapshotDate: Date,
		vacancyCount: number,
		applicationCount: number,
	): Promise<void> {
		await this.prisma.$executeRawUnsafe(
			"INSERT INTO reporting.etl_run_log (run_started_at, run_completed_at, status, rows_processed, last_snapshot_date) VALUES ($1, NOW(), 'SUCCESS', $2 + $3, $4);",
			snapshotDate,
			vacancyCount,
			applicationCount,
			snapshotDate.toISOString().slice(0, 10),
		);
	}
}
