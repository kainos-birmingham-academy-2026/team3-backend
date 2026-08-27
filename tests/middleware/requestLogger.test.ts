import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requestLogger } from "../../src/middleware/requestLogger.js";

describe("requestLogger", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("logs structured request telemetry after the response finishes", async () => {
		const logSpy = vi.spyOn(console, "info").mockImplementation(() => undefined);
		const app = express();
		app.use(requestLogger);
		app.get("/jobs", (_req, res) => res.status(200).json({ ok: true }));

		await request(app).get("/jobs?token=secret").expect(200);

		expect(logSpy).toHaveBeenCalledOnce();
		expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toEqual({
			event: "http_request",
			method: "GET",
			path: "/jobs",
			status: 200,
			durationMs: expect.any(Number),
		});
	});
});