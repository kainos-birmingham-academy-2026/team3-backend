import { EmailClient } from "@azure/communication-email";

const sendTimeoutMs = 60_000;

export function escapeHtml(value: string): string {
	return value.replace(
		/[&<>'"]/g,
		(character) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"'": "&#39;",
				'"': "&quot;",
			})[character] ?? character,
	);
}

export async function sendWelcomeEmail(
	email: string,
	name: string,
): Promise<void> {
	const connectionString = process.env.ACS_CONNECTION_STRING;
	const senderAddress = process.env.EMAIL_SENDER_ADDRESS;

	if (!connectionString) {
		throw new Error("ACS_CONNECTION_STRING is not configured");
	}

	if (!senderAddress) {
		throw new Error("EMAIL_SENDER_ADDRESS is not configured");
	}

	const safeName = escapeHtml(name);
	const emailClient = new EmailClient(connectionString);
	const abortController = new AbortController();
	const timeout = setTimeout(() => abortController.abort(), sendTimeoutMs);

	try {
		const poller = await emailClient.beginSend(
			{
				senderAddress,
				content: {
					subject: "Your account has been created",
					plainText: `Hi ${name},

Welcome! Your account has been created successfully and is ready to use.

You can now sign in to complete your profile and get started.

If you did not create this account, please contact the support team.

Best regards,
The Team`,
					html: `
            <!doctype html>
            <html lang="en">
              <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,sans-serif;color:#1f2933;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f6f8;padding:32px 16px;">
                  <tr>
                    <td align="center">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background-color:#ffffff;border:1px solid #d9e2ec;">
                        <tr>
                          <td style="padding:32px;">
                            <p style="margin:0 0 12px;font-size:14px;font-weight:700;color:#2563eb;text-transform:uppercase;">Account created</p>
                            <h1 style="margin:0 0 20px;font-size:28px;line-height:1.25;color:#102a43;">Welcome, ${safeName}</h1>
                            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Your account has been created successfully and is ready to use.</p>
                            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">You can now sign in to complete your profile and get started.</p>
                            <hr style="margin:24px 0;border:0;border-top:1px solid #d9e2ec;">
                            <p style="margin:0;font-size:13px;line-height:1.5;color:#627d98;">If you did not create this account, please contact the support team.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
				},
				recipients: {
					to: [{ address: email }],
				},
			},
			{ abortSignal: abortController.signal },
		);

		console.log(
			"ACS send request accepted:",
			JSON.stringify(poller.getOperationState(), null, 2),
		);
	} finally {
		clearTimeout(timeout);
	}
}

export async function sendApplicationCreatedEmail(
	email: string,
): Promise<void> {
	console.log(`Application created email -> ${email}`);
}

export async function sendApplicationAcceptedEmail(
	email: string,
): Promise<void> {
	console.log(`Application accepted email -> ${email}`);
}

export async function sendApplicationRejectedEmail(
	email: string,
): Promise<void> {
	console.log(`Application rejected email -> ${email}`);
}