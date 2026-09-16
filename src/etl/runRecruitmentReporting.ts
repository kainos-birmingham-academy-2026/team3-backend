import prisma from "../prismaClient.js";
import { RecruitmentReportingJob } from "./recruitmentReportingJob.js";

async function main(): Promise<void> {
	const job = new RecruitmentReportingJob(prisma as never);
	const result = await job.run();

	console.log(
		`Recruitment ETL completed: ${result.vacancyRows.length} vacancy snapshot rows and ${result.applicationRows.length} application fact rows processed.`,
	);
}

main().catch((error) => {
	console.error("Recruitment ETL failed", error);
	process.exitCode = 1;
});
