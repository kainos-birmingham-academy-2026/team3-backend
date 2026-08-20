import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";
import { StatusEnum } from "../src/generated/prisma/enums";

const prisma = new PrismaClient();

async function main() {
	// Statuses
	const [openStatus, closedStatus] = await Promise.all([
		prisma.status.upsert({
			where: { statusName: StatusEnum.OPEN },
			update: {},
			create: { statusName: StatusEnum.OPEN },
		}),
		prisma.status.upsert({
			where: { statusName: StatusEnum.CLOSED },
			update: {},
			create: { statusName: StatusEnum.CLOSED },
		}),
	]);

	// Locations
	const [
		belfast,
		glasgow,
		birmingham,
		london,
		_manchester,
		_edinburgh,
		remote,
	] = await Promise.all([
		prisma.location.upsert({
			where: { locationName: "Belfast" },
			update: {
				locationName: "Belfast",
				addressLine1: "10 Donegall Square South",
				addressLine2: "Floor 2",
				postcode: "BT1 5JD",
			},
			create: {
				locationName: "Belfast",
				addressLine1: "10 Donegall Square South",
				addressLine2: "Floor 2",
				postcode: "BT1 5JD",
			},
		}),
		prisma.location.upsert({
			where: { locationName: "Glasgow" },
			update: {
				locationName: "Glasgow",
				addressLine1: "110 Queen Street",
				addressLine2: "Suite 4A",
				postcode: "G1 3BX",
			},
			create: {
				locationName: "Glasgow",
				addressLine1: "110 Queen Street",
				addressLine2: "Suite 4A",
				postcode: "G1 3BX",
			},
		}),
		prisma.location.upsert({
			where: { locationName: "Birmingham" },
			update: {
				locationName: "Birmingham",
				addressLine1: "3 Brindleyplace",
				addressLine2: "Unit 12",
				postcode: "B1 2JB",
			},
			create: {
				locationName: "Birmingham",
				addressLine1: "3 Brindleyplace",
				addressLine2: "Unit 12",
				postcode: "B1 2JB",
			},
		}),
		prisma.location.upsert({
			where: { locationName: "London" },
			update: {
				locationName: "London",
				addressLine1: "25 Canada Square",
				addressLine2: "Level 18",
				postcode: "E14 5LQ",
			},
			create: {
				locationName: "London",
				addressLine1: "25 Canada Square",
				addressLine2: "Level 18",
				postcode: "E14 5LQ",
			},
		}),
		prisma.location.upsert({
			where: { locationName: "Manchester" },
			update: {
				locationName: "Manchester",
				addressLine1: "1 Spinningfields",
				addressLine2: "Suite 9",
				postcode: "M3 3EB",
			},
			create: {
				locationName: "Manchester",
				addressLine1: "1 Spinningfields",
				addressLine2: "Suite 9",
				postcode: "M3 3EB",
			},
		}),
		prisma.location.upsert({
			where: { locationName: "Edinburgh" },
			update: {
				locationName: "Edinburgh",
				addressLine1: "7 Castle Terrace",
				addressLine2: null,
				postcode: "EH1 2DP",
			},
			create: {
				locationName: "Edinburgh",
				addressLine1: "7 Castle Terrace",
				addressLine2: null,
				postcode: "EH1 2DP",
			},
		}),
		prisma.location.upsert({
			where: { locationName: "Remote" },
			update: {
				locationName: "Remote",
				addressLine1: "Remote Workforce Hub",
				addressLine2: null,
				postcode: "REMOTE",
			},
			create: {
				locationName: "Remote",
				addressLine1: "Remote Workforce Hub",
				addressLine2: null,
				postcode: "REMOTE",
			},
		}),
	]);

	// Users used by local development and E2E tests
	const passwordHash = await argon2.hash("password");

	const users = await Promise.all(
		[
			{ email: "test@example.com", role: "ADMIN" as const },
			{ email: "user@example.com", role: "USER" as const },
			{ email: "alex.johnson@example.com", role: "USER" as const },
			{ email: "samira.khan@example.com", role: "USER" as const },
			{ email: "jamie.lee@example.com", role: "USER" as const },
			{ email: "priya.patel@example.com", role: "USER" as const },
			{ email: "daniel.murphy@example.com", role: "USER" as const },
			{ email: "chloe.wilson@example.com", role: "USER" as const },
			{ email: "marcus.brown@example.com", role: "USER" as const },
			{ email: "sofia.garcia@example.com", role: "USER" as const },
			{ email: "noah.taylor@example.com", role: "USER" as const },
			{ email: "aisha.rahman@example.com", role: "USER" as const },
			{ email: "ethan.clark@example.com", role: "USER" as const },
			{ email: "grace.evans@example.com", role: "USER" as const },
			{ email: "leo.martin@example.com", role: "USER" as const },
			{ email: "maya.thompson@example.com", role: "USER" as const },
		].map((user) =>
			prisma.user.upsert({
				where: { email: user.email },
				update: { passwordHash, role: user.role },
				create: { ...user, passwordHash },
			}),
		),
	);

	// Capabilities
	const [engineering, _data, cloud, security, delivery] = await Promise.all([
		prisma.capability.upsert({
			where: { capabilityName: "Software Engineering" },
			update: {},
			create: { capabilityName: "Software Engineering" },
		}),
		prisma.capability.upsert({
			where: { capabilityName: "Data & AI" },
			update: {},
			create: { capabilityName: "Data & AI" },
		}),
		prisma.capability.upsert({
			where: { capabilityName: "Cloud & Infrastructure" },
			update: {},
			create: { capabilityName: "Cloud & Infrastructure" },
		}),
		prisma.capability.upsert({
			where: { capabilityName: "Cyber Security" },
			update: {},
			create: { capabilityName: "Cyber Security" },
		}),
		prisma.capability.upsert({
			where: { capabilityName: "Delivery Management" },
			update: {},
			create: { capabilityName: "Delivery Management" },
		}),
	]);

	// Bands
	const [trainee, associate, engineer, senior, lead, principal] =
		await Promise.all([
			prisma.band.upsert({
				where: { bandName: "Trainee" },
				update: {},
				create: { bandName: "Trainee" },
			}),
			prisma.band.upsert({
				where: { bandName: "Associate" },
				update: {},
				create: { bandName: "Associate" },
			}),
			prisma.band.upsert({
				where: { bandName: "Engineer" },
				update: {},
				create: { bandName: "Engineer" },
			}),
			prisma.band.upsert({
				where: { bandName: "Senior Engineer" },
				update: {},
				create: { bandName: "Senior Engineer" },
			}),
			prisma.band.upsert({
				where: { bandName: "Lead Engineer" },
				update: {},
				create: { bandName: "Lead Engineer" },
			}),
			prisma.band.upsert({
				where: { bandName: "Principal Engineer" },
				update: {},
				create: { bandName: "Principal Engineer" },
			}),
		]);

	// Job Roles
	const jobRoleSeedData = [
		{
			roleName: "Software Engineer",
			description: "Build and maintain backend services and APIs.",
			responsibilities:
				"Deliver features, write tests, and support production services.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/software-engineer",
			numberOfOpenPositions: 3,
			locationId: belfast.locationId,
			capabilityId: engineering.capabilityId,
			bandId: engineer.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-09-30"),
		},
		{
			roleName: "Senior Software Engineer",
			description: "Lead design and delivery of core platform components.",
			responsibilities:
				"Mentor engineers, drive architecture decisions, and improve reliability.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/senior-software-engineer",
			numberOfOpenPositions: 2,
			locationId: glasgow.locationId,
			capabilityId: engineering.capabilityId,
			bandId: senior.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-10-15"),
		},
		{
			roleName: "Lead Software Engineer",
			description: "Own delivery across multiple teams and technical domains.",
			responsibilities:
				"Set technical direction, coordinate delivery, and remove blockers.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/lead-software-engineer",
			numberOfOpenPositions: 1,
			locationId: birmingham.locationId,
			capabilityId: engineering.capabilityId,
			bandId: lead.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-09-05"),
		},
		{
			roleName: "Trainee Software Engineer",
			description: "Entry role focused on learning modern software practices.",
			responsibilities:
				"Pair program, complete training, and contribute to small features.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/trainee-software-engineer",
			numberOfOpenPositions: 4,
			locationId: belfast.locationId,
			capabilityId: engineering.capabilityId,
			bandId: trainee.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-08-31"),
		},
		{
			roleName: "Associate Software Engineer",
			description: "Develop application features under guidance.",
			responsibilities:
				"Implement stories, fix bugs, and collaborate in code reviews.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/associate-software-engineer",
			numberOfOpenPositions: 2,
			locationId: london.locationId,
			capabilityId: engineering.capabilityId,
			bandId: associate.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-11-01"),
		},
		{
			roleName: "Senior Cloud Engineer",
			description: "Design and operate scalable cloud infrastructure.",
			responsibilities:
				"Automate deployments, improve observability, and optimize cloud cost.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/senior-cloud-engineer",
			numberOfOpenPositions: 2,
			locationId: glasgow.locationId,
			capabilityId: cloud.capabilityId,
			bandId: senior.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-10-20"),
		},
		{
			roleName: "DevOps Engineer",
			description: "Improve CI/CD and infrastructure reliability.",
			responsibilities: "Maintain pipelines, IaC, and environment standards.",
			sharepointUrl: "https://sharepoint.example.com/job-roles/devops-engineer",
			numberOfOpenPositions: 2,
			locationId: birmingham.locationId,
			capabilityId: cloud.capabilityId,
			bandId: engineer.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-08-20"),
		},
		{
			roleName: "Cyber Security Engineer",
			description: "Implement security controls and secure SDLC practices.",
			responsibilities:
				"Threat model systems, triage vulnerabilities, and support audits.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/cyber-security-engineer",
			numberOfOpenPositions: 1,
			locationId: london.locationId,
			capabilityId: security.capabilityId,
			bandId: engineer.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-09-25"),
		},
		{
			roleName: "Senior Cyber Security Engineer",
			description: "Lead security engineering across products and platforms.",
			responsibilities:
				"Define controls, mentor teams, and guide incident readiness.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/senior-cyber-security-engineer",
			numberOfOpenPositions: 1,
			locationId: remote.locationId,
			capabilityId: security.capabilityId,
			bandId: senior.bandId,
			statusId: openStatus.statusId,
			closingDate: new Date("2026-10-05"),
		},
		{
			roleName: "Delivery Manager",
			description: "Coordinate delivery plans and stakeholder communication.",
			responsibilities: "Manage roadmap cadence, risks, and team dependencies.",
			sharepointUrl:
				"https://sharepoint.example.com/job-roles/delivery-manager",
			numberOfOpenPositions: 0,
			locationId: belfast.locationId,
			capabilityId: delivery.capabilityId,
			bandId: principal.bandId,
			statusId: closedStatus.statusId,
			closingDate: new Date("2026-07-31"),
		},
	];

	const jobRoles = await Promise.all(
		jobRoleSeedData.map((jobRole) =>
			prisma.jobRole.upsert({
				where: { roleName: jobRole.roleName },
				update: jobRole,
				create: jobRole,
			}),
		),
	);

	// Applications cover list, hire, reject, and terminal-state E2E scenarios.
	const usersByEmail = new Map(users.map((user) => [user.email, user]));
	const jobRolesByName = new Map(
		jobRoles.map((jobRole) => [jobRole.roleName, jobRole]),
	);
	const cvText =
		"Experienced engineer with a track record of delivering accessible, reliable services. Skilled in TypeScript, automated testing, cloud platforms, collaborative delivery, and supporting production systems.";
	const applicationSeedData = [
		["user@example.com", "Software Engineer", "IN_PROGRESS", "2026-08-14"],
		[
			"alex.johnson@example.com",
			"Software Engineer",
			"IN_PROGRESS",
			"2026-08-15",
		],
		["samira.khan@example.com", "Software Engineer", "HIRED", "2026-08-12"],
		["jamie.lee@example.com", "Software Engineer", "REJECTED", "2026-08-11"],
		[
			"priya.patel@example.com",
			"Senior Software Engineer",
			"IN_PROGRESS",
			"2026-08-16",
		],
		[
			"daniel.murphy@example.com",
			"Senior Software Engineer",
			"IN_PROGRESS",
			"2026-08-17",
		],
		[
			"alex.johnson@example.com",
			"Senior Cloud Engineer",
			"IN_PROGRESS",
			"2026-08-18",
		],
		[
			"samira.khan@example.com",
			"Cyber Security Engineer",
			"IN_PROGRESS",
			"2026-08-19",
		],
		[
			"jamie.lee@example.com",
			"Associate Software Engineer",
			"HIRED",
			"2026-08-10",
		],
		[
			"priya.patel@example.com",
			"Trainee Software Engineer",
			"REJECTED",
			"2026-08-09",
		],
		[
			"chloe.wilson@example.com",
			"Software Engineer",
			"IN_PROGRESS",
			"2026-08-08",
		],
		[
			"marcus.brown@example.com",
			"Senior Cloud Engineer",
			"IN_PROGRESS",
			"2026-08-07",
		],
		["sofia.garcia@example.com", "DevOps Engineer", "HIRED", "2026-08-06"],
		[
			"noah.taylor@example.com",
			"Cyber Security Engineer",
			"REJECTED",
			"2026-08-05",
		],
		[
			"aisha.rahman@example.com",
			"Associate Software Engineer",
			"IN_PROGRESS",
			"2026-08-04",
		],
		[
			"ethan.clark@example.com",
			"Lead Software Engineer",
			"IN_PROGRESS",
			"2026-08-03",
		],
		[
			"grace.evans@example.com",
			"Trainee Software Engineer",
			"HIRED",
			"2026-08-02",
		],
		[
			"leo.martin@example.com",
			"Senior Cyber Security Engineer",
			"IN_PROGRESS",
			"2026-08-01",
		],
		[
			"maya.thompson@example.com",
			"Senior Software Engineer",
			"REJECTED",
			"2026-07-31",
		],
	] as const;

	await Promise.all(
		applicationSeedData.map(
			([email, roleName, applicationStatus, createdAt]) => {
				const user = usersByEmail.get(email);
				const jobRole = jobRolesByName.get(roleName);

				if (!user || !jobRole) {
					throw new Error(
						`Missing seed dependency for ${email} and ${roleName}`,
					);
				}

				const data = {
					cvText,
					applicationStatus,
					createdAt: new Date(createdAt),
				};

				return prisma.application.upsert({
					where: {
						jobRoleId_userId: {
							jobRoleId: jobRole.jobRoleId,
							userId: user.id,
						},
					},
					update: data,
					create: {
						...data,
						jobRoleId: jobRole.jobRoleId,
						userId: user.id,
					},
				});
			},
		),
	);

	console.log("Seed complete.");
}

main()
	.catch((e) => {
		console.error(e);
		throw e;
	})
	.finally(() => prisma.$disconnect());
