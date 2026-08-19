import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { validateBody, validateParams } from "../../src/middleware/validate.ts";

describe("validate middleware", () => {
	let statusSpy: ReturnType<typeof vi.fn>;
	let jsonSpy: ReturnType<typeof vi.fn>;
	let nextSpy: ReturnType<typeof vi.fn>;
	let res: {
		status: ReturnType<typeof vi.fn>;
		json: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		statusSpy = vi.fn().mockReturnThis();
		jsonSpy = vi.fn().mockReturnThis();
		nextSpy = vi.fn();
		res = {
			status: statusSpy,
			json: jsonSpy,
		};
	});

	it("should call next for valid body", () => {
		const schema = z.object({
			email: z.email(),
			password: z.string().min(1),
		});
		const req = {
			body: { email: "user@example.com", password: "password123" },
		};
		const middleware = validateBody(schema);

		middleware(req as any, res as any, nextSpy as any);

		expect(nextSpy).toHaveBeenCalledTimes(1);
		expect(statusSpy).not.toHaveBeenCalled();
	});

	it("should return 400 with formatted body errors for invalid body", () => {
		const schema = z.object({
			email: z.email(),
			password: z.string().min(1),
		});
		const req = {
			body: { email: "not-an-email", password: "" },
		};
		const middleware = validateBody(schema);

		middleware(req as any, res as any, nextSpy as any);

		expect(nextSpy).not.toHaveBeenCalled();
		expect(statusSpy).toHaveBeenCalledWith(400);
		expect(jsonSpy).toHaveBeenCalledWith({
			errors: expect.arrayContaining([
				expect.objectContaining({
					field: "email",
					message: expect.any(String),
				}),
				expect.objectContaining({
					field: "password",
					message: expect.any(String),
				}),
			]),
		});
	});

	it("should parse and replace request body with schema output", () => {
		const schema = z.object({ count: z.coerce.number().int() });
		const req = {
			body: { count: "42" },
		};
		const middleware = validateBody(schema);

		middleware(req as any, res as any, nextSpy as any);

		expect(nextSpy).toHaveBeenCalledTimes(1);
		expect(req.body).toEqual({ count: 42 });
	});

	it("should return 400 with formatted params errors for invalid params", () => {
		const schema = z.object({ id: z.coerce.number().int().positive() });
		const req = {
			params: { id: "abc" },
		};
		const middleware = validateParams(schema);

		middleware(req as any, res as any, nextSpy as any);

		expect(nextSpy).not.toHaveBeenCalled();
		expect(statusSpy).toHaveBeenCalledWith(400);
		expect(jsonSpy).toHaveBeenCalledWith({
			errors: expect.arrayContaining([
				expect.objectContaining({ field: "id", message: expect.any(String) }),
			]),
		});
	});

	it("should parse and replace request params with schema output", () => {
		const schema = z.object({ id: z.coerce.number().int().positive() });
		const req = {
			params: { id: "42" },
		};
		const middleware = validateParams(schema);

		middleware(req as any, res as any, nextSpy as any);

		expect(nextSpy).toHaveBeenCalledTimes(1);
		expect(statusSpy).not.toHaveBeenCalled();
		expect(req.params).toEqual({ id: 42 });
	});
});
