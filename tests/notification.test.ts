import { test } from "vitest";
import { publishNotification } from "../src/notificationPublisher";


test("publishes notification", async () => {
  await publishNotification(
    "AccountCreated",
    "mhadi071004@gmail.com",
    {
      name: "Mohammed"
    }
  );
});