import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const execute = (command, args) =>
	execFileSync(command, args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "inherit"],
	}).trim();

export function recoverOpenAI(run = execute, log = console.log) {
	const azure = (...args) =>
		JSON.parse(run("az", [...args, "--only-show-errors", "--output", "json"]));
	const subscription = azure("account", "show").id;
	if (!subscription) throw new Error("Azure subscription ID is missing");
	const group = "rg-team3-dev";
	const account = "aoai-team3-chatbot-dev";
	const deployment = "team3-chatbot-gpt5-nano";
	const location = "uksouth";
	const accountId = `/subscriptions/${subscription}/resourceGroups/${group}/providers/Microsoft.CognitiveServices/accounts/${account}`;
	const deletedId = `/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/locations/${location}/resourceGroups/${group}/deletedAccounts/${account}`;
	const sameId = (left, right) =>
		typeof left === "string" && left.toLowerCase() === right.toLowerCase();
	const state = new Set(run("terraform", ["state", "list"]).split(/\r?\n/));
	const activeAccounts = azure(
		"cognitiveservices",
		"account",
		"list",
		"--subscription",
		subscription,
		"--resource-group",
		group,
	);
	if (!Array.isArray(activeAccounts))
		throw new Error("Unexpected active account response");
	let active = activeAccounts.some((entry) => sameId(entry.id, accountId));
	if (!active) {
		let url = `https://management.azure.com/subscriptions/${subscription}/providers/Microsoft.CognitiveServices/deletedAccounts?api-version=2021-04-30`;
		let deleted = false;
		while (url) {
			if (!url.startsWith("https://management.azure.com/"))
				throw new Error("Unexpected deleted-account pagination URL");
			const page = azure("rest", "--method", "get", "--url", url);
			if (!Array.isArray(page.value))
				throw new Error("Unexpected deleted account response");
			for (const entry of page.value) {
				if (sameId(entry.id, accountId) || sameId(entry.id, deletedId)) {
					if (entry.location?.toLowerCase() !== location)
						throw new Error(
							"Deleted account location differs from dev configuration",
						);
					deleted = true;
				} else if (entry.name === account && !entry.id) {
					throw new Error("Cannot verify deleted account resource identity");
				}
			}
			url = page.nextLink;
		}
		if (deleted) {
			log(`Restoring ${account}; no purge will be performed.`);
			azure(
				"rest",
				"--method",
				"put",
				"--url",
				`https://management.azure.com${accountId}?api-version=2021-04-30`,
				"--body",
				JSON.stringify({ location, properties: { restore: true } }),
			);
			active = true;
		}
	}
	if (!active) {
		log(
			"No active or soft-deleted dev OpenAI account found; Terraform will create it.",
		);
		return;
	}
	run("az", [
		"resource",
		"wait",
		"--ids",
		accountId,
		"--api-version",
		"2021-04-30",
		"--created",
		"--interval",
		"10",
		"--timeout",
		"600",
		"--only-show-errors",
	]);
	const importMissing = (address, id) => {
		if (state.has(address)) {
			log(`${address} is already tracked; skipping import.`);
			return;
		}
		run("terraform", [
			"import",
			"-input=false",
			"-lock-timeout=5m",
			address,
			id,
		]);
		log(`Imported ${address}.`);
	};
	importMissing("azurerm_cognitive_account.openai", accountId);
	const deployments = azure(
		"cognitiveservices",
		"account",
		"deployment",
		"list",
		"--subscription",
		subscription,
		"--resource-group",
		group,
		"--name",
		account,
	);
	if (!Array.isArray(deployments))
		throw new Error("Unexpected deployment response");
	if (deployments.some((entry) => entry.name === deployment)) {
		importMissing(
			"azurerm_cognitive_deployment.openai",
			`${accountId}/deployments/${deployment}`,
		);
	} else {
		log("Model deployment is absent; Terraform will create it.");
	}
}

if (
	process.argv[1] &&
	import.meta.url === pathToFileURL(process.argv[1]).href
) {
	recoverOpenAI();
}
