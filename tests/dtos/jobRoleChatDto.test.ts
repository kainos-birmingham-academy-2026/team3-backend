import { describe, expect, it } from "vitest";
import { JobRoleChatSchema } from "../../src/dtos/jobRoleChatDto.js";

describe("JobRoleChatSchema", () => {
	it("accepts and trims a question", () => {
		expect(JobRoleChatSchema.parse({ message: "  What roles are open?  " })).toEqual(
			{ message: "What roles are open?" },
		);
	});

	it.each([
		["an empty message", { message: "   " }],
		["a message over 500 characters", { message: "a".repeat(501) }],
		["unknown fields", { message: "What roles are open?", history: [] }],
	])("rejects %s", (_description, input) => {
		expect(JobRoleChatSchema.safeParse(input).success).toBe(false);
	});
});