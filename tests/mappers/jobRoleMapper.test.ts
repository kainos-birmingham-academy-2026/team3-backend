import { beforeEach, describe, expect, it } from "vitest";
import { JobRoleMapper } from "../../src/mappers/jobRoleMapper.js";
import { JobRole } from "../../src/models/jobRole.js";

describe("JobRoleMapper", () => {
	let mapper: JobRoleMapper;

	beforeEach(() => {
		mapper = new JobRoleMapper();
	});

	describe("jobRoleToResponse", () => {
		it("should map JobRole to JobRoleResponse correctly", () => {
			const jobRole = new JobRole(
				1,
				"Software Engineer",
				"Build and maintain software systems",
				"Code development, testing, deployment",
				"https://sharepoint.example.com/roles/1",
				2,
				new Date("2026-12-31"),
				"Software Engineering",
				"Engineer",
				"Birmingham",
				"123 Street",
				null,
				"B1 1AA",
				"OPEN",
				new Date("2026-01-01"),
				new Date("2026-01-01"),
			);

			const response = mapper.jobRoleToResponse(jobRole);

			expect(response).toSatisfy(
				(value) =>
					value.jobRoleId === 1 &&
					value.roleName === "Software Engineer" &&
					value.locationName === "Birmingham" &&
					value.capabilityName === "Software Engineering" &&
					value.bandName === "Engineer" &&
					value.statusName === "OPEN",
			);
		});

		it("should exclude detailed fields from response", () => {
			const jobRole = new JobRole(
				1,
				"Role",
				"Description content",
				"Responsibilities content",
				"URL",
				1,
				new Date("2026-12-31"),
				"Capability",
				"Band",
				"Location",
				"Address",
				"Address 2",
				"Postcode",
				"OPEN",
				new Date(),
				new Date(),
			);

			const response = mapper.jobRoleToResponse(jobRole);

			expect(response).not.toHaveProperty("description");
			expect(response).not.toHaveProperty("responsibilities");
			expect(response).not.toHaveProperty("sharepointUrl");
			expect(response).not.toHaveProperty("numberOfOpenPositions");
			expect(response).toHaveProperty("jobRoleId");
			expect(response).toHaveProperty("roleName");
		});
	});

	describe("jobRoleToDetailedResponse", () => {
		it("should map JobRole to JobRoleDetailedResponse correctly", () => {
			const jobRole = new JobRole(
				1,
				"Software Engineer",
				"Build and maintain software systems",
				"Code development, testing, deployment",
				"https://sharepoint.example.com/roles/1",
				2,
				new Date("2026-12-31"),
				"Software Engineering",
				"Engineer",
				"Birmingham",
				"123 Street",
				null,
				"B1 1AA",
				"OPEN",
				new Date("2026-01-01"),
				new Date("2026-01-01"),
			);

			const response = mapper.jobRoleToDetailedResponse(jobRole);

			expect(response).toSatisfy(
				(value) =>
					value.jobRoleId === 1 &&
					value.roleName === "Software Engineer" &&
					value.description === "Build and maintain software systems" &&
					value.responsibilities === "Code development, testing, deployment" &&
					value.sharepointUrl === "https://sharepoint.example.com/roles/1" &&
					value.numberOfOpenPositions === 2 &&
					value.locationName === "Birmingham" &&
					value.capabilityName === "Software Engineering" &&
					value.bandName === "Engineer" &&
					value.statusName === "OPEN" &&
					value.addressLine1 === "123 Street" &&
					value.postcode === "B1 1AA",
			);
		});

		it("should include all fields in detailed response", () => {
			const jobRole = new JobRole(
				1,
				"Role",
				"Description",
				"Responsibilities",
				"URL",
				5,
				new Date("2026-12-31"),
				"Capability",
				"Band",
				"Location",
				"Address",
				"Address 2",
				"Postcode",
				"OPEN",
				new Date(),
				new Date(),
			);

			const response = mapper.jobRoleToDetailedResponse(jobRole);

			expect(response).toHaveProperty("description");
			expect(response).toHaveProperty("responsibilities");
			expect(response).toHaveProperty("sharepointUrl");
			expect(response).toHaveProperty("numberOfOpenPositions");
			expect(response).toHaveProperty("addressLine1");
			expect(response).toHaveProperty("addressLine2");
			expect(response).toHaveProperty("postcode");
		});
	});
});
