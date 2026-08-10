import { z } from "zod";

export const LoginSchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;

export interface LoginResponseDto {
	token: string;
}
