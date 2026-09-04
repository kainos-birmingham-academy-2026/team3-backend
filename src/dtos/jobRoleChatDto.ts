import { z } from "zod";

export const JobRoleChatSchema = z.strictObject({
	message: z
		.string()
		.trim()
		.min(1, "Message is required")
		.max(500, "Message must be 500 characters or fewer"),
});

export type JobRoleChatRequestDto = z.infer<typeof JobRoleChatSchema>;