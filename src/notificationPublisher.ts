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
  await sender.sendMessages({
    body: {
      type,
      email,
      ...data,
      createdAt: new Date().toISOString(),
    },
  });
}