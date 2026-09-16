import { lookup } from "node:dns/promises";

export async function runPrivateSmokeTest({
	lookupAddresses = lookup,
	createClient = async () => {
		const { PrismaClient } = await import(
			"/app/dist/generated/prisma/client.js"
		);
		return new PrismaClient({ log: [] });
	},
	env = process.env,
	logger = console,
	runtime = process,
} = {}) {
	const deadline = setTimeout(() => {
		logger.error("Private smoke test timed out.");
		runtime.exit(1);
	}, 60000);

	let prisma;
	let stage = "configuration";
	try {
		const databaseUrl = new URL(env.DATABASE_URL);
		const expectedAddress = env.EXPECTED_PRIVATE_IP;
		if (!expectedAddress || !databaseUrl.hostname) {
			throw new Error("Missing configuration");
		}
		stage = "private DNS";
		const addresses = await lookupAddresses(databaseUrl.hostname, {
			all: true,
		});
		if (
			!addresses.length ||
			addresses.some(({ address }) => address !== expectedAddress)
		) {
			throw new Error("Unexpected DNS address");
		}
		logger.log("Private DNS check passed.");
		stage = "database query";
		prisma = await createClient();
		const result = await prisma.$queryRaw`SELECT 1 AS ok`;
		if (result.length !== 1 || result[0].ok !== 1) {
			throw new Error("Unexpected query result");
		}
		logger.log("Read-only database connectivity check passed.");
	} catch {
		logger.error(`Private smoke test failed at ${stage}.`);
		runtime.exitCode = 1;
	} finally {
		try {
			await prisma?.$disconnect();
		} catch {
			logger.error("Private smoke test database disconnect failed.");
			runtime.exitCode = 1;
		}
		clearTimeout(deadline);
	}
}
