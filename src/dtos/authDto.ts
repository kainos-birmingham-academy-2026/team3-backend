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

export const VerifyEmailSchema = z.object({
	email: z.email(),
	verificationCode: z.string().regex(/^\d{5}$/),
});

export const ResendVerificationSchema = z.object({
	email: z.email(),
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;
export type RegisterRequestDto = z.infer<typeof RegisterSchema>;
export type VerifyEmailRequestDto = z.infer<typeof VerifyEmailSchema>;
export type ResendVerificationRequestDto = z.infer<
	typeof ResendVerificationSchema
>;

export interface LoginResponseDto {
	token: string;
}

export interface RegisterResponseDto {
	message: string;
}
