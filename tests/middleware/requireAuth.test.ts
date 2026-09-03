import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuth } from "../../src/middleware/requireAuth.ts";

type Req = Partial<Request> & {
	header: Request["header"];
};

type Res = Partial<Response> & {
	locals: Record<string, unknown>;
	status: ReturnType<typeof vi.fn>;
	json: ReturnType<typeof vi.fn>;
};

function createReq(authHeader?: string): Req {
	return {
		header: ((name: string) => {
			if (name.toLowerCase() === "authorization") {
				return authHeader;
			}
			return undefined;
		}) as Request["header"],
	};
}

function createRes(): Res {
	const status = vi.fn();
	const json = vi.fn();
	const res: Res = {
		locals: {},
		status,
		json,
	};

	status.mockReturnValue(res);
	json.mockReturnValue(res);
	return res;
}

describe("requireAuth middleware", () => {
	let originalJwtSecret: string | undefined;
	let next: NextFunction;

	beforeEach(() => {
		originalJwtSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "test-secret";
		next = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		if (originalJwtSecret === undefined) {
			delete process.env.JWT_SECRET;
		} else {
			process.env.JWT_SECRET = originalJwtSecret;
		}
	});

	it("should return 401 when auth header is missing", () => {
		const req = createReq();
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 401 when bearer token is blank", () => {
		const req = createReq("Bearer    ");
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 500 when JWT secret is missing", () => {
		delete process.env.JWT_SECRET;
		const req = createReq("Bearer valid-token");
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 401 when decoded token payload is a string", () => {
		vi.spyOn(jwt, "verify").mockReturnValueOnce("decoded-as-string" as never);
		const req = createReq("Bearer valid-token");
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 401 when required claims are invalid", () => {
		vi.spyOn(jwt, "verify").mockReturnValueOnce({
			userId: 1,
			email: "admin@example.com",
			role: "NOT_A_ROLE",
		} as never);
		const req = createReq("Bearer valid-token");
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
		expect(next).not.toHaveBeenCalled();
	});

	it("should return 401 when jwt verification throws", () => {
		vi.spyOn(jwt, "verify").mockImplementationOnce(() => {
			throw new Error("invalid signature");
		});
		const req = createReq("Bearer broken-token");
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
		expect(next).not.toHaveBeenCalled();
	});

	it("should set auth user and call next for valid token", () => {
		vi.spyOn(jwt, "verify").mockReturnValueOnce({
			userId: 1,
			email: "user@example.com",
			role: "USER",
		} as never);
		const req = createReq("Bearer valid-token");
		const res = createRes();

		requireAuth(req as Request, res as Response, next);

		expect(res.locals.authUser).toEqual({
			userId: 1,
			email: "user@example.com",
			role: "USER",
		});
		expect(next).toHaveBeenCalledTimes(1);
		expect(res.status).not.toHaveBeenCalled();
	});
});
