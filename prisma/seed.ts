import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

 async function main() {
  //status 
  enum Status {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
  }
  // Locations
  const [belfast, glasgow, birmingham, london, manchester, edinburgh, remote] = await Promise.all([
    prisma.location.create({ data: { locationName: "Belfast" } }),
    prisma.location.create({ data: { locationName: "Glasgow" } }),
    prisma.location.create({ data: { locationName: "Birmingham" } }),
    prisma.location.create({ data: { locationName: "London" } }),
    prisma.location.create({ data: { locationName: "Manchester" } }),
    prisma.location.create({ data: { locationName: "Edinburgh" } }),
    prisma.location.create({ data: { locationName: "Remote" } }),
  ]);

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
        locationId: belfast.locationId,
        capabilityId: engineering.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-09-30"),
        status: Status.OPEN,
      },
      {
        roleName: "Senior Software Engineer",
        locationId: glasgow.locationId,
        capabilityId: engineering.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-15"),
        status: Status.OPEN,
      },
      {
        roleName: "Lead Software Engineer",
        locationId: birmingham.locationId,
        capabilityId: engineering.capabilityId,
        bandId: lead.nameId,
        closingDate: new Date("2026-09-05"),
        status: Status.OPEN,
      },
      {
        roleName: "Trainee Software Engineer",
        locationId: belfast.locationId,
        capabilityId: engineering.capabilityId,
        bandId: trainee.nameId,
        closingDate: new Date("2026-08-31"),
        status: Status.OPEN,
      },
      {
        roleName: "Associate Software Engineer",
        locationId: london.locationId,
        capabilityId: engineering.capabilityId,
        bandId: associate.nameId,
        closingDate: new Date("2026-11-01"),
        status: Status.OPEN,
      },
      {
        roleName: "Senior Cloud Engineer",
        locationId: glasgow.locationId,
        capabilityId: cloud.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-20"),
        status: Status.OPEN,
      },
      {
        roleName: "DevOps Engineer",
        locationId: birmingham.locationId,
        capabilityId: cloud.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-08-20"),
        status: Status.OPEN,
      },
      {
        roleName: "Cyber Security Engineer",
        locationId: london.locationId,
        capabilityId: security.capabilityId,
        bandId: engineer.nameId,
        closingDate: new Date("2026-09-25"),
        status: Status.OPEN,
      },
      {
        roleName: "Senior Cyber Security Engineer",
        locationId: remote.locationId,
        capabilityId: security.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-10-05"),
        status: Status.OPEN,
      },
      {
        roleName: "Delivery Manager",
        locationId: belfast.locationId,
        capabilityId: delivery.capabilityId,
        bandId: senior.nameId,
        closingDate: new Date("2026-07-31"),
        status: Status.CLOSED,
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
