import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { StatusEnum } from "../src/generated/prisma/enums";
import argon2 from "argon2";

//status 
enum Status {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
}

const prisma = new PrismaClient();

async function main() {
  // Statuses
  const [openStatus, closedStatus] = await Promise.all([
    prisma.status.create({ data: { statusName: StatusEnum.OPEN } }),
    prisma.status.create({ data: { statusName: StatusEnum.CLOSED } }),
  ]);

  // Locations
  const [belfast, glasgow, birmingham, london, manchester, edinburgh, remote] = await Promise.all([
    prisma.location.create({
      data: {
        locationName: "Belfast",
        addressLine1: "10 Donegall Square South",
        addressLine2: "Floor 2",
        postcode: "BT1 5JD",
      },
    }),
    prisma.location.create({
      data: {
        locationName: "Glasgow",
        addressLine1: "110 Queen Street",
        addressLine2: "Suite 4A",
        postcode: "G1 3BX",
      },
    }),
    prisma.location.create({
      data: {
        locationName: "Birmingham",
        addressLine1: "3 Brindleyplace",
        addressLine2: "Unit 12",
        postcode: "B1 2JB",
      },
    }),
    prisma.location.create({
      data: {
        locationName: "London",
        addressLine1: "25 Canada Square",
        addressLine2: "Level 18",
        postcode: "E14 5LQ",
      },
    }),
    prisma.location.create({
      data: {
        locationName: "Manchester",
        addressLine1: "1 Spinningfields",
        addressLine2: "Suite 9",
        postcode: "M3 3EB",
      },
    }),
    prisma.location.create({
      data: {
        locationName: "Edinburgh",
        addressLine1: "7 Castle Terrace",
        addressLine2: null,
        postcode: "EH1 2DP",
      },
    }),
    prisma.location.create({
      data: {
        locationName: "Remote",
        addressLine1: "Remote Workforce Hub",
        addressLine2: null,
        postcode: "REMOTE",
      },
    }),
  ]);
  
  // Create a test user
	const passwordHash = await argon2.hash("password");

	await prisma.user.upsert({
		where: { email: "test@example.com" },
		update: { passwordHash },
		create: {
			email: "test@example.com",
			passwordHash,
		},
	});

  // Capabilities
  const [engineering, data, cloud, security, delivery] = await Promise.all([
    prisma.capability.create({ data: { capabilityName: "Software Engineering" } }),
    prisma.capability.create({ data: { capabilityName: "Data & AI" } }),
    prisma.capability.create({ data: { capabilityName: "Cloud & Infrastructure" } }),
    prisma.capability.create({ data: { capabilityName: "Cyber Security" } }),
    prisma.capability.create({ data: { capabilityName: "Delivery Management" } }),
  ]);

  // Bands
  const [trainee, associate, engineer, senior, lead, principal] = await Promise.all([
    prisma.band.create({ data: { bandName: "Trainee" } }),
    prisma.band.create({ data: { bandName: "Associate" } }),
    prisma.band.create({ data: { bandName: "Engineer" } }),
    prisma.band.create({ data: { bandName: "Senior Engineer" } }),
    prisma.band.create({ data: { bandName: "Lead Engineer" } }),
    prisma.band.create({ data: { bandName: "Principal Engineer" } }),
  ]);

  // Job Roles
  await prisma.jobRole.createMany({
    data: [
      {
        roleName: "Software Engineer",
        description: "Build and maintain backend services and APIs.",
        responsibilities: "Deliver features, write tests, and support production services.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/software-engineer",
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
        responsibilities: "Mentor engineers, drive architecture decisions, and improve reliability.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/senior-software-engineer",
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
        responsibilities: "Set technical direction, coordinate delivery, and remove blockers.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/lead-software-engineer",
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
        responsibilities: "Pair program, complete training, and contribute to small features.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/trainee-software-engineer",
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
        responsibilities: "Implement stories, fix bugs, and collaborate in code reviews.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/associate-software-engineer",
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
        responsibilities: "Automate deployments, improve observability, and optimize cloud cost.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/senior-cloud-engineer",
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
        responsibilities: "Threat model systems, triage vulnerabilities, and support audits.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/cyber-security-engineer",
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
        responsibilities: "Define controls, mentor teams, and guide incident readiness.",
        sharepointUrl: "https://sharepoint.example.com/job-roles/senior-cyber-security-engineer",
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
        sharepointUrl: "https://sharepoint.example.com/job-roles/delivery-manager",
        numberOfOpenPositions: 0,
        locationId: belfast.locationId,
        capabilityId: delivery.capabilityId,
        bandId: principal.bandId,
        statusId: closedStatus.statusId,
        closingDate: new Date("2026-07-31"),
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(() => prisma.$disconnect());