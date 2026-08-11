import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const TOKEN_ERROR = "Invalid token";

interface AuthTokenPayload {
	userId: number;
	email: string;
}

export const requireAuth: RequestHandler = (req, res, next) => {
	// Read the Authorization header in the form: Bearer <token>
	const authHeader = req.header("authorization");

	// Return a generic 401 so we do not leak token parsing details.
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: TOKEN_ERROR });
	}

	// Strip the Bearer prefix and validate token presence.
	const token = authHeader.slice("Bearer ".length).trim();

	if (!token) {
		return res.status(401).json({ message: TOKEN_ERROR });
	}

	// JWT secret must exist at runtime; this is a server config problem.
	const secret = process.env.JWT_SECRET;

	if (!secret) {
		return res.status(500).json({ error: "Internal server error" });
	}

	try {
		// Verify signature and expiration.
		const decoded = jwt.verify(token, secret);

		// We only accept object payloads, not string payloads.
		if (typeof decoded === "string") {
			return res.status(401).json({ message: TOKEN_ERROR });
		}

		const payload = decoded as Partial<AuthTokenPayload>;

		// Enforce required claim types before trusting payload values.
		if (
			typeof payload.userId !== "number" ||
			typeof payload.email !== "string"
		) {
			return res.status(401).json({ message: TOKEN_ERROR });
		}

		// Expose authenticated user context to downstream handlers.
		res.locals.authUser = {
			userId: payload.userId,
			email: payload.email,
		};

		// Continue request pipeline.
		next();
	} catch {
		// Includes invalid signature, malformed token, and expired token.
		return res.status(401).json({ message: TOKEN_ERROR });
	}
};
