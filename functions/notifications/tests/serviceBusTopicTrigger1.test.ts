import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseNotification } from "../src/functions/serviceBusTopicTrigger1.js";
import {
	escapeHtml,
	generateVerificationCode,
} from "../src/services/emailService.js";

describe("parseNotification", () => {
	it("parses an account-created notification", () => {
		assert.deepEqual(
			parseNotification({
				type: "AccountCreated",
				email: "user@example.com",
				name: "Mahdi",
			}),
			{
				type: "AccountCreated",
				email: "user@example.com",
				name: "Mahdi",
			},
		);
	});

	it("parses a JSON message", () => {
		assert.deepEqual(
			parseNotification(
				JSON.stringify({
					type: "AccountCreated",
					email: "user@example.com",
				}),
			),
			{
				type: "AccountCreated",
				email: "user@example.com",
				name: undefined,
			},
		);
	});

	it("ignores invalid messages", () => {
		assert.equal(parseNotification({ type: "AccountCreated" }), undefined);
	});
});

describe("escapeHtml", () => {
	it("escapes user-provided names before placing them in HTML", () => {
		assert.equal(
			escapeHtml('<script>alert("x")</script>'),
			"&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
		);
	});
});

describe("generateVerificationCode", () => {
	it("generates a five-digit numeric code", () => {
		for (let attempt = 0; attempt < 100; attempt += 1) {
			assert.match(generateVerificationCode(), /^\d{5}$/);
		}
	});
});
