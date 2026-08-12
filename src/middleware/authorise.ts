import type { RequestHandler } from "express";

export const USER_ROLES = {
	ADMIN: "ADMIN",
	USER: "USER",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

const FORBIDDEN_ERROR = "Forbidden";

export const allowRoles = (allowedRoles: readonly UserRole[]): RequestHandler => {
	return (req, res, next) => {
		const authUser = res.locals.authUser as { role?: UserRole } | undefined;

		if (!authUser || !authUser.role) {
			return res.status(401).json({ message: "Invalid token" });
		}

		if (!allowedRoles.includes(authUser.role)) {
			return res.status(403).json({ message: FORBIDDEN_ERROR });
		}

		next();
	};
};
