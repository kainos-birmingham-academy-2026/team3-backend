import { z } from "zod";

export const LoginSchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export const RegisterSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(9, "Password must be more than 8 characters")
		.regex(/[a-z]/, "Password must include a lowercase letter")
		.regex(/[A-Z]/, "Password must include an uppercase letter")
		.regex(/[^A-Za-z0-9]/, "Password must include a special character"),
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;
export type RegisterRequestDto = z.infer<typeof RegisterSchema>;

export interface LoginResponseDto {
	token: string;
}

export interface RegisterResponseDto {
	message: string;
}
