import { app, type InvocationContext } from "@azure/functions";
import {
	sendApplicationAcceptedEmail,
	sendApplicationCreatedEmail,
	sendApplicationRejectedEmail,
	sendVerificationCodeEmail,
} from "../services/emailService.js";

interface NotificationMessage {
	type: string;
	email: string;
	name?: string;
	code?: string;
}

export function parseNotification(
	message: unknown,
): NotificationMessage | undefined {
	const parsed =
		typeof message === "string" ? (JSON.parse(message) as unknown) : message;

	if (
		typeof parsed !== "object" ||
		parsed === null ||
		!("type" in parsed) ||
		!("email" in parsed) ||
		typeof parsed.type !== "string" ||
		typeof parsed.email !== "string" ||
		parsed.email.length === 0
	) {
		return undefined;
	}

	return {
		type: parsed.type,
		email: parsed.email,
		name:
			"name" in parsed && typeof parsed.name === "string"
				? parsed.name
				: undefined,
		code:
			"code" in parsed && typeof parsed.code === "string"
				? parsed.code
				: undefined,
	};
}

export async function serviceBusTopicTrigger1(
	message: unknown,
	context: InvocationContext,
): Promise<void> {
	const notification = parseNotification(message);

	if (!notification) {
		context.warn("Ignoring invalid notification");
		return;
	}

	context.log("FUNCTION EXECUTED", notification.type);

	switch (notification.type) {
		case "AccountCreated":
			if (!notification.code) {
				context.warn("Ignoring account-created notification without a code");
				return;
			}
			await sendVerificationCodeEmail(
				notification.email,
				notification.name ?? "User",
				notification.code,
			);
			break;
		case "ApplicationCreated":
			await sendApplicationCreatedEmail(notification.email);
			break;
		case "ApplicationAccepted":
			await sendApplicationAcceptedEmail(notification.email);
			break;
		case "ApplicationRejected":
			await sendApplicationRejectedEmail(notification.email);
			break;
		default:
			context.log(`Unknown notification type: ${notification.type}`);
	}
}

app.serviceBusTopic("serviceBusTopicTrigger1", {
	connection: "rgteam3svb_SERVICEBUS",
	topicName: "notifications",
	subscriptionName: "email-processor",
	handler: serviceBusTopicTrigger1,
});
