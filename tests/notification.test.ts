import { test } from "vitest";
import { publishNotification } from "../src/notificationPublisher";

test("publishes notification", async () => {
  await publishNotification(
    "AccountCreated",
    "test@example.com",
    {
      name: "Mohammed"
    }
  );
});