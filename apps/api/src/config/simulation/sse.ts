import type { FastifyReply } from "fastify";
import { simulationService } from "../../app/services/simulation.service.ts";
import { subscribeToRun } from "./run-events.ts";

function prepareStream(reply: FastifyReply) {
  reply.hijack();
  for (const [name, value] of Object.entries(reply.getHeaders())) {
    if (value !== undefined) {
      reply.raw.setHeader(name, value);
    }
  }
  reply.raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });
}

export async function streamSimulationRun(id: string, reply: FastifyReply) {
  await simulationService.getScenarioRun(id);
  prepareStream(reply);

  let closed = false;
  let updates = Promise.resolve();

  function cleanup() {
    if (closed) {
      return;
    }
    closed = true;
    clearInterval(heartbeat);
    unsubscribe();
  }

  function closeStream() {
    reply.raw.end();
    cleanup();
  }

  async function sendSnapshot() {
    if (closed) {
      return;
    }
    const run = await simulationService.getScenarioRun(id);
    if (closed) {
      return;
    }
    if (!reply.raw.write(`data: ${JSON.stringify(run)}\n\n`)) {
      closeStream();
      return;
    }
    if (run.status !== "PENDING" && run.status !== "RUNNING") {
      closeStream();
    }
  }

  function refresh() {
    updates = updates.then(sendSnapshot).catch((error: unknown) => {
      reply.log.error(error, "Simulation stream failed.");
      closeStream();
    });
  }

  const unsubscribe = subscribeToRun(id, refresh);
  const heartbeat = setInterval(() => {
    if (!reply.raw.write(": heartbeat\n\n")) {
      closeStream();
    }
  }, 15000);

  reply.raw.on("close", cleanup);
  refresh();
}
