import { spawn } from "node:child_process";
import path from "node:path";
import type { InvocationContext } from "@azure/functions";

const backendEtlScript = path.resolve(
	process.cwd(),
	"backend-dist/etl/runRecruitmentReporting.js",
);

export function runRecruitmentReporting(
	context: InvocationContext,
): Promise<void> {
	context.log(`Starting recruitment reporting ETL via ${backendEtlScript}`);

	return new Promise<void>((resolve, reject) => {
		const child = spawn(process.execPath, [backendEtlScript], {
			cwd: process.cwd(),
			env: { ...process.env },
			stdio: ["ignore", "pipe", "pipe"],
		});

		child.stdout?.on("data", (data: Buffer) => {
			context.log(data.toString().trimEnd());
		});

		child.stderr?.on("data", (data: Buffer) => {
			context.error(data.toString().trimEnd());
		});

		child.on("exit", (code) => {
			if (code === 0) {
				context.log("Recruitment reporting ETL completed");
				resolve();
				return;
			}

			reject(new Error(`Recruitment reporting ETL exited with code ${code}`));
		});

		child.on("error", reject);
	});
}
