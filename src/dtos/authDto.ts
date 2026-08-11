import { z } from "zod";

export const LoginSchema = z.object({
	email: z.email(),
	password: z.string().min(1),
});

export const RegisterSchema = z.object({
	email: z.email(),
	password: z.string().min(8),
});

export type LoginRequestDto = z.infer<typeof LoginSchema>;
export type RegisterRequestDto = z.infer<typeof RegisterSchema>;

export interface LoginResponseDto {
	token: string;
}

export interface RegisterResponseDto {
	message: string;
}
