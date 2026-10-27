import { isCancel, note, outro, select } from "@clack/prompts";
import { stdin } from "node:process";
import { prismaSingleton } from "../src/config/prisma.ts";

const CLOCK_ID = "default";
const DRIFT_THRESHOLD_MS = 60_000;

try {
  const clock = await prismaSingleton.virtualClock.findUnique({
    where: { id: CLOCK_ID },
  });

  if (
    clock &&
    Math.abs(clock.currentDateTime.getTime() - Date.now()) > DRIFT_THRESHOLD_MS
  ) {
    note(
      `Virtual datetime: ${clock.currentDateTime.toLocaleString()}\nSystem datetime: ${new Date().toLocaleString()}`,
      "Clock differs from system time",
    );

    if (!stdin.isTTY) {
      throw new Error("A terminal is required to choose the virtual datetime.");
    }

    const choice = await select({
      message: "Choose what to do with the virtual clock",
      options: [
        { value: "keep", label: "Keep current datetime" },
        { value: "reset", label: "Reset to now" },
      ],
      initialValue: "keep",
    });

    if (isCancel(choice)) {
      outro("Startup cancelled; the virtual clock was left unchanged.");
      process.exitCode = 130;
    } else if (choice === "reset") {
      await prismaSingleton.virtualClock.update({
        where: { id: CLOCK_ID },
        data: { currentDateTime: new Date() },
      });
      outro("Virtual datetime reset to now.");
    } else {
      outro("Keeping the current virtual datetime.");
    }
  }
} finally {
  await prismaSingleton.$disconnect();
}
