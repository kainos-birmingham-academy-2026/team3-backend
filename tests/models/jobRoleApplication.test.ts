import { describe, expect, it } from "vitest";
import { JobRoleApplication } from "../../src/models/jobRoleApplication.js";

describe("JobRoleApplication", () => {
	it("should create an instance with all properties", () => {
		const app = new JobRoleApplication(1, 2, 3, "cv-ref");
		expect(app.applicationId).toBe(1);
		expect(app.jobRoleId).toBe(2);
		expect(app.userId).toBe(3);
		expect(app.cvText).toBe("cv-ref");
	});
});
