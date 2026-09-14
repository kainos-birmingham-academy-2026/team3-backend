import assert from "node:assert/strict";
import test from "node:test";
import { recoverOpenAI } from "./recover-openai.mjs";

const accountId =
	"/subscriptions/subscription/resourceGroups/rg-team3-dev/providers/Microsoft.CognitiveServices/accounts/aoai-team3-chatbot-dev";
const accountAddress = "azurerm_cognitive_account.openai";
const deploymentAddress = "azurerm_cognitive_deployment.openai";
const deployment = { name: "team3-chatbot-gpt5-nano" };

function scenario(options = {}) {
	const calls = [];
	const run = (command, args) => {
		calls.push({ command, args });
		const operation = `${command} ${args.slice(0, 4).join(" ")}`;
		if (options.fail && operation.startsWith(options.fail))
			throw new Error("Simulated API failure");
		if (command === "terraform") {
			if (args[0] === "state") return (options.state ?? []).join("\n");
			if (args[0] === "import") return "Import successful";
		}
		if (args[0] === "account") return JSON.stringify({ id: "subscription" });
		if (args[0] === "resource") return "";
		if (args[0] === "rest") {
			if (args[2] === "put") return "{}";
			if (options.deletedResponse)
				return JSON.stringify(options.deletedResponse);
			if (options.paginated && !args[4].includes("page=2")) {
				return JSON.stringify({
					value: [],
					nextLink: "https://management.azure.com/deleted?page=2",
				});
			}
			return JSON.stringify({ value: options.deleted ?? [] });
		}
		if (args[2] === "list") return JSON.stringify(options.active ?? []);
		if (args[2] === "deployment")
			return JSON.stringify(options.deployments ?? []);
		throw new Error(`Unexpected command: ${operation}`);
	};
	return { calls, execute: () => recoverOpenAI(run, () => {}) };
}

const imports = (calls) =>
	calls.filter(
		({ command, args }) => command === "terraform" && args[0] === "import",
	);
const restores = (calls) =>
	calls.filter(({ args }) => args[0] === "rest" && args[2] === "put");

test("fresh environment leaves creation to Terraform", () => {
	const recovery = scenario();
	recovery.execute();
	assert.equal(imports(recovery.calls).length, 0);
	assert.equal(restores(recovery.calls).length, 0);
});

test("normal deployment does not restore or import tracked resources", () => {
	const recovery = scenario({
		active: [{ id: accountId }],
		state: [accountAddress, deploymentAddress],
		deployments: [deployment],
	});
	recovery.execute();
	assert.equal(imports(recovery.calls).length, 0);
	assert.equal(restores(recovery.calls).length, 0);
});

test("restores deleted account, waits, then imports account and recovered deployment", () => {
	const recovery = scenario({
		deleted: [{ id: accountId, location: "uksouth" }],
		deployments: [deployment],
		paginated: true,
	});
	recovery.execute();
	assert.equal(restores(recovery.calls).length, 1);
	const restoreArgs = restores(recovery.calls)[0].args;
	assert.deepEqual(JSON.parse(restoreArgs[restoreArgs.indexOf("--body") + 1]), {
		location: "uksouth",
		properties: { restore: true },
	});
	assert.deepEqual(
		imports(recovery.calls).map(({ args }) => args[3]),
		[accountAddress, deploymentAddress],
	);
	const restoreIndex = recovery.calls.indexOf(restores(recovery.calls)[0]);
	const waitIndex = recovery.calls.findIndex(
		({ args }) => args[0] === "resource" && args[1] === "wait",
	);
	assert.ok(restoreIndex < waitIndex);
	assert.ok(waitIndex < recovery.calls.indexOf(imports(recovery.calls)[0]));
	assert.ok(
		!recovery.calls.some(
			({ args }) => args.includes("purge") || args.includes("delete"),
		),
	);
});

test("retry after account import only imports missing model deployment", () => {
	const recovery = scenario({
		active: [{ id: accountId }],
		state: [accountAddress],
		deployments: [deployment],
	});
	recovery.execute();
	assert.deepEqual(
		imports(recovery.calls).map(({ args }) => args[3]),
		[deploymentAddress],
	);
});

test("active untracked account is imported without requiring a model to exist", () => {
	const recovery = scenario({ active: [{ id: accountId }] });
	recovery.execute();
	assert.deepEqual(
		imports(recovery.calls).map(({ args }) => args[3]),
		[accountAddress],
	);
	assert.equal(restores(recovery.calls).length, 0);
});

test("same name in another resource group is not restored", () => {
	const recovery = scenario({
		deleted: [
			{
				id: accountId.replace("rg-team3-dev", "rg-other"),
				location: "uksouth",
			},
		],
	});
	recovery.execute();
	assert.equal(restores(recovery.calls).length, 0);
});

test("rejects malformed deleted-account responses", () => {
	assert.throws(
		scenario({ deletedResponse: {} }).execute,
		/Unexpected deleted account response/,
	);
});

test("rejects an unexpected recovery region", () => {
	assert.throws(
		scenario({ deleted: [{ id: accountId, location: "westus" }] }).execute,
		/location differs/,
	);
});

for (const failure of [
	"terraform state",
	"az cognitiveservices account list",
	"az rest --method get",
	"az rest --method put",
	"az resource wait",
	"terraform import",
]) {
	test(`stops on ${failure} failure`, () => {
		const recovery = scenario({
			fail: failure,
			deleted: [{ id: accountId, location: "uksouth" }],
			deployments: [deployment],
		});
		assert.throws(recovery.execute, /Simulated API failure/);
		if (failure !== "terraform import")
			assert.equal(imports(recovery.calls).length, 0);
	});
}
