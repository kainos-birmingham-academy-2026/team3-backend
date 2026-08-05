import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
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
        location: "Belfast",
        capabilityId: engineering.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-09-30"),
        status: "open",
      },
      {
        roleName: "Senior Software Engineer",
        location: "Glasgow",
        capabilityId: engineering.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-15"),
        status: "open",
      },
      {
        roleName: "Lead Software Engineer",
        location: "Birmingham",
        capabilityId: engineering.capabilityId,
        bandId: lead.nameId,
        closingDate: new Date("2026-09-05"),
        status: "open",
      },
      {
        roleName: "Trainee Software Engineer",
        location: "Belfast",
        capabilityId: engineering.capabilityId,
        bandId: trainee.nameId,
        closingDate: new Date("2026-08-31"),
        status: "open",
      },
      {
        roleName: "Associate Software Engineer",
        location: "London",
        capabilityId: engineering.capabilityId,
        bandId: associate.nameId,
        closingDate: new Date("2026-11-01"),
        status: "open",
      },
      {
        roleName: "Principal Software Engineer",
        location: "Remote",
        capabilityId: engineering.capabilityId,
        bandId: principal.nameId,
        closingDate: new Date("2026-10-31"),
        status: "open",
      },
      {
        roleName: "Data Engineer",
        location: "Manchester",
        capabilityId: data.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-09-20"),
        status: "open",
      },
      {
        roleName: "Senior Data Engineer",
        location: "Edinburgh",
        capabilityId: data.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-10"),
        status: "open",
      },
      {
        roleName: "Machine Learning Engineer",
        location: "London",
        capabilityId: data.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-09-15"),
        status: "open",
      },
      {
        roleName: "Cloud Engineer",
        location: "Belfast",
        capabilityId: cloud.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-09-01"),
        status: "open",
      },
      {
        roleName: "Senior Cloud Engineer",
        location: "Glasgow",
        capabilityId: cloud.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-20"),
        status: "open",
      },
      {
        roleName: "DevOps Engineer",
        location: "Birmingham",
        capabilityId: cloud.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-08-20"),
        status: "open",
      },
      {
        roleName: "Cyber Security Engineer",
        location: "London",
        capabilityId: security.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-09-25"),
        status: "open",
      },
      {
        roleName: "Senior Cyber Security Engineer",
        location: "Remote",
        capabilityId: security.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-05"),
        status: "open",
      },
      {
        roleName: "Delivery Manager",
        location: "Belfast",
        capabilityId: delivery.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-07-31"),
        status: "closed",
      },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
