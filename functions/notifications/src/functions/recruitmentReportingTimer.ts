import { spawn } from "node:child_process";
import path from "node:path";
import { app, type InvocationContext } from "@azure/functions";

const backendEtlScript = path.resolve(
  process.cwd(),
  "../../src/etl/runRecruitmentReporting.ts",
);

export async function recruitmentReportingTimer(
  _timer: unknown,
  context: InvocationContext,
): Promise<void> {
  context.log(`Starting recruitment reporting ETL via ${backendEtlScript}`);

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", backendEtlScript],
      {
        cwd: path.resolve(process.cwd(), "../.."),
        env: { ...process.env },
        stdio: "inherit",
      },
    );

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Recruitment reporting ETL exited with code ${code}`));
    });

    child.on("error", reject);
  });

  context.log("Recruitment reporting ETL completed");
}

app.timer("recruitmentReportingTimer", {
  schedule: "0 0 * * *",
  runOnStartup: false,
  handler: recruitmentReportingTimer,
});
