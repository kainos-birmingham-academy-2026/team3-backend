import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { publishNotification } from "../src/notificationPublisher";

const { mockCreateSender, mockSendMessages, mockServiceBusClient } = vi.hoisted(
  () => ({
    mockCreateSender: vi.fn(),
    mockSendMessages: vi.fn(),
    mockServiceBusClient: vi.fn(),
  }),
);

vi.mock("@azure/service-bus", () => ({
  ServiceBusClient: mockServiceBusClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AZURE_SERVICE_BUS_CONNECTION_STRING = "test-connection-string";
  delete process.env.AZURE_SERVICE_BUS_TOPIC;
  mockCreateSender.mockReturnValue({ sendMessages: mockSendMessages });
  mockServiceBusClient.mockImplementation(
    class {
      public createSender = mockCreateSender;
    },
  );
});

afterEach(() => {
  delete process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  delete process.env.AZURE_SERVICE_BUS_TOPIC;
});

test("publishes an account-created notification", async () => {
  await publishNotification("AccountCreated", "user@example.com", {
    name: "Mahdi",
  });

  expect(mockServiceBusClient).toHaveBeenCalledWith("test-connection-string");
  expect(mockCreateSender).toHaveBeenCalledWith("notifications");
  expect(mockSendMessages).toHaveBeenCalledWith({
    body: {
      type: "AccountCreated",
      email: "user@example.com",
      name: "Mahdi",
      createdAt: expect.any(String),
    },
  });
});

test("throws a clear error when Service Bus is not configured", async () => {
  delete process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

  await expect(
    publishNotification("AccountCreated", "user@example.com"),
  ).rejects.toThrow("AZURE_SERVICE_BUS_CONNECTION_STRING is not configured");
  expect(mockServiceBusClient).not.toHaveBeenCalled();
});