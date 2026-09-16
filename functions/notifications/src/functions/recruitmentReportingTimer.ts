import { app, type InvocationContext } from "@azure/functions";
import { runRecruitmentReporting } from "./recruitmentReportingExecution.js";

export async function recruitmentReportingTimer(
	_timer: unknown,
	context: InvocationContext,
): Promise<void> {
	await runRecruitmentReporting(context);
}

app.timer("recruitmentReportingTimer", {
	schedule: "0 0 * * *",
	runOnStartup: false,
	handler: recruitmentReportingTimer,
});
