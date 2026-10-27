import { spawn } from "node:child_process";

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn("pnpm", args, { stdio: "inherit" });
    const forwardSignal = (signal) => child.kill(signal);
    process.once("SIGINT", forwardSignal);
    process.once("SIGTERM", forwardSignal);

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      process.removeListener("SIGINT", forwardSignal);
      process.removeListener("SIGTERM", forwardSignal);
      resolve(signal ? 1 : (code ?? 1));
    });
  });
}

for (const args of [
  ["--filter", "@mockment/api", "exec", "prisma", "migrate", "dev"],
  ["--filter", "@mockment/api", "exec", "tsx", "scripts/check-virtual-clock.ts"],
  ["-r", "--parallel", "dev"],
]) {
  const code = await run(args);
  if (code !== 0) process.exit(code);
}
