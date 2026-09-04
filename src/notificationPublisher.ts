import { ServiceBusClient } from "@azure/service-bus";
import "dotenv/config";

const connectionString =
  process.env.AZURE_SERVICE_BUS_CONNECTION_STRING!;

console.log("Connection String Loaded:", !!connectionString);

const topicName =
  process.env.AZURE_SERVICE_BUS_TOPIC ?? "notifications";

const client = new ServiceBusClient(connectionString);

const sender = client.createSender(topicName);

export async function publishNotification(
  type: string,
  email: string,
  data: Record<string, unknown> = {}
) {
  console.log("Publishing notification...");

  const payload = {
    type,
    email,
    ...data,
    createdAt: new Date().toISOString(),
  };

  console.log("Payload:", JSON.stringify(payload, null, 2));

  await sender.sendMessages({
    body: payload,
  });

  console.log("Notification published successfully");
}