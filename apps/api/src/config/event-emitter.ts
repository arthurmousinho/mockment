import { EventEmitter } from "node:events";
import type { FastifyInstance } from "fastify";
import { env } from "./env.ts";

export const eventEmitterSingleton = new EventEmitter();

// export async function registerVirtualClockSseRoute(app: FastifyInstance) {
//   app.get("/virtual-clock/events", async (request, reply) => {
//     reply.hijack();

//     reply.raw.writeHead(200, {
//       "Content-Type": "text/event-stream",
//       "Cache-Control": "no-cache",
//       Connection: "keep-alive",
//       "Access-Control-Allow-Origin": env.WEB_URL,
//     });

//     const onClockTick = (currentDateTime: Date) => {
//       reply.raw.write(
//         `event: clock-tick\n` +
//           `data: ${JSON.stringify(currentDateTime.toISOString())}\n\n`,
//       );
//     };

//     eventEmitterSingleton.on("clock-tick", onClockTick);

//     request.raw.on("close", () => {
//       eventEmitterSingleton.off("clock-tick", onClockTick);
//     });
//   });
// }
