import {
	app,
	type HttpRequest,
	type HttpResponseInit,
	type InvocationContext,
} from "@azure/functions";
import { runRecruitmentReporting } from "./recruitmentReportingExecution.js";

export async function recruitmentReportingHttp(
	_request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	try {
		await runRecruitmentReporting(context);
		return {
			status: 200,
			jsonBody: { status: "SUCCESS" },
		};
	} catch (error) {
		context.error("Recruitment reporting ETL failed", error);
		return {
			status: 500,
			jsonBody: { status: "FAILED" },
		};
	}
}

app.http("recruitmentReportingHttp", {
	methods: ["POST"],
	authLevel: "admin",
	route: "recruitment-reporting/run",
	handler: recruitmentReportingHttp,
});
