import { describe, expect, it } from "vitest";
import { JobRole } from "../../src/models/jobRole.js";

describe("JobRole Model", () => {
	it("should create instance with all properties", () => {
		const jobRoleId = 1;
		const roleName = "Software Engineer";
		const description = "Build and maintain software systems";
		const responsibilities = "Code development, testing, deployment";
		const sharepointUrl = "https://sharepoint.example.com/roles/1";
		const numberOfOpenPositions = 2;
		const closingDate = new Date("2026-12-31");
		const capabilityName = "Software Engineering";
		const bandName = "Engineer";
		const locationName = "Birmingham";
		const addressLine1 = "123 Street";
		const addressLine2 = null;
		const postcode = "B1 1AA";
		const statusName = "OPEN";
		const createdAt = new Date("2026-01-01");
		const updatedAt = new Date("2026-01-01");

		const jobRole = new JobRole(
			jobRoleId,
			roleName,
			description,
			responsibilities,
			sharepointUrl,
			numberOfOpenPositions,
			closingDate,
			capabilityName,
			bandName,
			locationName,
			addressLine1,
			addressLine2,
			postcode,
			statusName,
			createdAt,
			updatedAt,
		);

		expect(jobRole.jobRoleId).toBe(jobRoleId);
		expect(jobRole.roleName).toBe(roleName);
		expect(jobRole.description).toBe(description);
		expect(jobRole.responsibilities).toBe(responsibilities);
		expect(jobRole.sharepointUrl).toBe(sharepointUrl);
		expect(jobRole.numberOfOpenPositions).toBe(numberOfOpenPositions);
		expect(jobRole.closingDate).toEqual(closingDate);
		expect(jobRole.capabilityName).toBe(capabilityName);
		expect(jobRole.bandName).toBe(bandName);
		expect(jobRole.locationName).toBe(locationName);
		expect(jobRole.addressLine1).toBe(addressLine1);
		expect(jobRole.addressLine2).toBe(addressLine2);
		expect(jobRole.postcode).toBe(postcode);
		expect(jobRole.statusName).toBe(statusName);
		expect(jobRole.createdAt).toEqual(createdAt);
		expect(jobRole.updatedAt).toEqual(updatedAt);
	});

	it("should have all properties as readonly", () => {
		const jobRole = new JobRole(
			1,
			"Role",
			"Desc",
			"Resp",
			"URL",
			1,
			new Date(),
			"Capability",
			"Band",
			"Location",
			"Address",
			null,
			"Postcode",
			"OPEN",
			new Date(),
			new Date(),
		);

		expect(jobRole.jobRoleId).toBe(1);
		expect(jobRole.roleName).toBe("Role");
		expect(jobRole.description).toBe("Desc");
		expect(jobRole.responsibilities).toBe("Resp");
		expect(jobRole.sharepointUrl).toBe("URL");
		expect(jobRole.numberOfOpenPositions).toBe(1);
		expect(jobRole.capabilityName).toBe("Capability");
		expect(jobRole.bandName).toBe("Band");
		expect(jobRole.locationName).toBe("Location");
		expect(jobRole.addressLine1).toBe("Address");
		expect(jobRole.postcode).toBe("Postcode");
		expect(jobRole.statusName).toBe("OPEN");
	});

	it("should handle null addressLine2", () => {
		const jobRole = new JobRole(
			1,
			"Role",
			"Desc",
			"Resp",
			"URL",
			1,
			new Date(),
			"Capability",
			"Band",
			"Location",
			"Address1",
			null,
			"Postcode",
			"OPEN",
			new Date(),
			new Date(),
		);

		expect(jobRole.addressLine2).toBeNull();
	});

	it("should handle addressLine2 when provided", () => {
		const jobRole = new JobRole(
			1,
			"Role",
			"Desc",
			"Resp",
			"URL",
			1,
			new Date(),
			"Capability",
			"Band",
			"Location",
			"Address1",
			"Address2",
			"Postcode",
			"OPEN",
			new Date(),
			new Date(),
		);

		expect(jobRole.addressLine2).toBe("Address2");
	});
});
