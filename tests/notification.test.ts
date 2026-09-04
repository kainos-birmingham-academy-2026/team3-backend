import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { publishNotification } from "../src/notificationPublisher";

const { mockCreateSender, mockSendMessages, mockServiceBusConstructor } =
  vi.hoisted(() => ({
    mockCreateSender: vi.fn(),
    mockSendMessages: vi.fn(),
    mockServiceBusConstructor: vi.fn(),
  }));

vi.mock("@azure/service-bus", () => ({
  ServiceBusClient: class {
    public createSender = mockCreateSender;

    public constructor(connectionString: string) {
      mockServiceBusConstructor(connectionString);
    }
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.AZURE_SERVICE_BUS_CONNECTION_STRING = "test-connection-string";
  delete process.env.AZURE_SERVICE_BUS_TOPIC;
  mockCreateSender.mockReturnValue({ sendMessages: mockSendMessages });
});

afterEach(() => {
  delete process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;
  delete process.env.AZURE_SERVICE_BUS_TOPIC;
});

test("publishes an account-created notification", async () => {
  await publishNotification("AccountCreated", "user@example.com", {
    name: "Mahdi",
  });

  expect(mockServiceBusConstructor).toHaveBeenCalledWith(
    "test-connection-string",
  );
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

test("skips publishing when Service Bus is not configured", async () => {
  delete process.env.AZURE_SERVICE_BUS_CONNECTION_STRING;

  await expect(
    publishNotification("AccountCreated", "user@example.com"),
  ).resolves.toBeUndefined();
  expect(mockServiceBusConstructor).not.toHaveBeenCalled();
  expect(mockSendMessages).not.toHaveBeenCalled();
});
