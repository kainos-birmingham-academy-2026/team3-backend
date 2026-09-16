import { describe, expect, it, vi } from "vitest";
import { runPrivateSmokeTest } from "../infrastructure/environments/test/private-smoke-test.mjs";

function fixture() {
	const client = {
		$queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]),
		$disconnect: vi.fn().mockResolvedValue(undefined),
	};
	return {
		client,
		options: {
			env: {
				DATABASE_URL: "postgresql://user:secret@database.example/db",
				EXPECTED_PRIVATE_IP: "10.63.2.4",
			},
			lookupAddresses: vi.fn().mockResolvedValue([{ address: "10.63.2.4" }]),
			createClient: vi.fn().mockResolvedValue(client),
			logger: { log: vi.fn(), error: vi.fn() },
			runtime: { exitCode: 0, exit: vi.fn() },
		},
	};
}

describe("private smoke test", () => {
	it("rejects missing configuration before opening a connection", async () => {
		const { options } = fixture();
		delete options.env.EXPECTED_PRIVATE_IP;
		await runPrivateSmokeTest(options);
		expect(options.runtime.exitCode).toBe(1);
		expect(options.createClient).not.toHaveBeenCalled();
	});

	it("rejects unexpected query results", async () => {
		const { client, options } = fixture();
		client.$queryRaw.mockResolvedValue([{ ok: 0 }]);
		await runPrivateSmokeTest(options);
		expect(options.runtime.exitCode).toBe(1);
		expect(client.$disconnect).toHaveBeenCalledOnce();
	});

	it("terminates a stalled probe after 60 seconds", async () => {
		vi.useFakeTimers();
		try {
			const { options } = fixture();
			let releaseLookup;
			options.lookupAddresses.mockReturnValue(
				new Promise((resolve) => {
					releaseLookup = resolve;
				}),
			);
			const pending = runPrivateSmokeTest(options);
			await vi.advanceTimersByTimeAsync(60000);
			expect(options.runtime.exit).toHaveBeenCalledWith(1);
			releaseLookup([]);
			await pending;
		} finally {
			vi.useRealTimers();
		}
	});

	it("checks DNS and executes only SELECT 1", async () => {
		const { client, options } = fixture();
		await runPrivateSmokeTest(options);
		expect(options.runtime.exitCode).toBe(0);
		expect(client.$queryRaw.mock.calls[0][0]).toEqual(["SELECT 1 AS ok"]);
		expect(client.$disconnect).toHaveBeenCalledOnce();
	});

	it.each([
		[],
		[{ address: "203.0.113.1" }],
		[{ address: "10.63.2.4" }, { address: "203.0.113.1" }],
	])("rejects missing or unexpected DNS answers (%j)", async (...addresses) => {
		const { options } = fixture();
		options.lookupAddresses.mockResolvedValue(addresses);
		await runPrivateSmokeTest(options);
		expect(options.runtime.exitCode).toBe(1);
		expect(options.createClient).not.toHaveBeenCalled();
	});

	it("fails query errors without logging credentials and disconnects", async () => {
		const { client, options } = fixture();
		client.$queryRaw.mockRejectedValue(new Error(options.env.DATABASE_URL));
		await runPrivateSmokeTest(options);
		expect(options.runtime.exitCode).toBe(1);
		expect(options.logger.error).toHaveBeenCalledWith(
			"Private smoke test failed at database query.",
		);
		expect(JSON.stringify(options.logger.error.mock.calls)).not.toContain(
			"secret",
		);
		expect(client.$disconnect).toHaveBeenCalledOnce();
	});
});
