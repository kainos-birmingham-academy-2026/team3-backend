import { describe, it, expect } from "vitest";
import { JobRoleResponse } from "../../src/models/jobRoleResponse.js";

describe("JobRoleResponse Model", () => {
	it("should create instance with all properties", () => {
		const jobRoleId = 1;
		const roleName = "Software Engineer";
		const closingDate = new Date("2026-12-31");
		const capabilityName = "Software Engineering";
		const bandName = "Engineer";
		const locationName = "Birmingham";
		const statusName = "OPEN";

		const response = new JobRoleResponse(
			jobRoleId,
			roleName,
			closingDate,
			capabilityName,
			bandName,
			locationName,
			statusName,
		);

		expect(response.jobRoleId).toBe(jobRoleId);
		expect(response.roleName).toBe(roleName);
		expect(response.closingDate).toEqual(closingDate);
		expect(response.capabilityName).toBe(capabilityName);
		expect(response.bandName).toBe(bandName);
		expect(response.locationName).toBe(locationName);
		expect(response.statusName).toBe(statusName);
	});

	it("should have jobRoleId as readonly", () => {
		const response = new JobRoleResponse(
			1,
			"Role",
			new Date(),
			"Capability",
			"Band",
			"Location",
			"OPEN",
		);
		expect(response.jobRoleId).toBe(1);
	});

	it("should have roleName as readonly", () => {
		const response = new JobRoleResponse(
			1,
			"Developer",
			new Date(),
			"Capability",
			"Band",
			"Location",
			"OPEN",
		);
		expect(response.roleName).toBe("Developer");
	});

	it("should have closingDate as readonly", () => {
		const closingDate = new Date("2026-12-31");
		const response = new JobRoleResponse(
			1,
			"Role",
			closingDate,
			"Capability",
			"Band",
			"Location",
			"OPEN",
		);
		expect(response.closingDate).toEqual(closingDate);
	});

	it("should handle null closingDate", () => {
		const response = new JobRoleResponse(
			1,
			"Role",
			null,
			"Capability",
			"Band",
			"Location",
			"OPEN",
		);
		expect(response.closingDate).toBeNull();
	});

	it("should have capabilityName as readonly", () => {
		const response = new JobRoleResponse(
			1,
			"Role",
			new Date(),
			"Data & AI",
			"Band",
			"Location",
			"OPEN",
		);
		expect(response.capabilityName).toBe("Data & AI");
	});

	it("should have bandName as readonly", () => {
		const response = new JobRoleResponse(
			1,
			"Role",
			new Date(),
			"Capability",
			"Senior Engineer",
			"Location",
			"OPEN",
		);
		expect(response.bandName).toBe("Senior Engineer");
	});

	it("should have locationName as readonly", () => {
		const response = new JobRoleResponse(
			1,
			"Role",
			new Date(),
			"Capability",
			"Band",
			"London",
			"OPEN",
		);
		expect(response.locationName).toBe("London");
	});

	it("should have statusName as readonly", () => {
		const response = new JobRoleResponse(
			1,
			"Role",
			new Date(),
			"Capability",
			"Band",
			"Location",
			"CLOSED",
		);
		expect(response.statusName).toBe("CLOSED");
	});
});
