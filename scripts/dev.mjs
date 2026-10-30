import { spawn } from "node:child_process";
import { constants } from "node:fs";
import { copyFile } from "node:fs/promises";

// Resolve paths from this script so startup also works outside the repo root.
const root = new URL("../", import.meta.url);

// Bootstrap local environment files without overwriting existing configuration.
for (const [example, target] of [
  ["apps/api/.env.example", "apps/api/.env"],
  ["apps/web/.env.example", "apps/web/.env.local"],
]) {
  try {
    await copyFile(
      new URL(example, root),
      new URL(target, root),
      constants.COPYFILE_EXCL,
    );
    console.log(`Created ${target} from ${example}`);
  } catch (error) {
    // Existing files are expected; surface other failures, such as permissions.
    if (error.code !== "EEXIST") throw error;
  }
}

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", args, { cwd: root, stdio: "inherit" });
    // Forward shutdown requests to the active command.
    const forwardSignal = (signal) => child.kill(signal);
    process.once("SIGINT", forwardSignal);
    process.once("SIGTERM", forwardSignal);

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      // Remove listeners before starting the next command.
      process.removeListener("SIGINT", forwardSignal);
      process.removeListener("SIGTERM", forwardSignal);
      // Treat signal termination or a missing exit code as a startup failure.
      resolve(signal ? 1 : (code ?? 1));
    });
  });
}

// Generate the client, apply migrations, and check the clock before starting apps.
for (const args of [
  ["--filter", "@mockment/api", "exec", "prisma", "generate"],
  ["--filter", "@mockment/api", "exec", "prisma", "migrate", "dev"],
  [
    "--filter",
    "@mockment/api",
    "exec",
    "tsx",
    "scripts/check-virtual-clock.ts",
  ],
  ["-r", "--parallel", "dev"],
]) {
  const code = await run(args);
  // Stop immediately if a prerequisite fails.
  if (code !== 0) process.exit(code);
}
