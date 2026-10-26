import z from "zod";
import { EventType } from "../../../generated/prisma/enums.ts";
import { searchablePaginationSchema } from "../../common/search.schema.ts";

export const eventListSchema = searchablePaginationSchema;
export type EventListInput = z.infer<typeof eventListSchema>;

export const emitEventSchema = z.object({
  type: z.enum(EventType),
  paymentId: z.string().optional(),
  subscriptionId: z.string().optional(),
  payload: z.any().optional(),
});

export type EmitEventInput = z.infer<typeof emitEventSchema>;

export const findAllEventsSchema = z.object({
  id: z.uuid(),
  type: z.enum(EventType),
  paymentId: z.string().nullable(),
  subscriptionId: z.string().nullable(),
  payload: z.any().nullable(),
  createdAt: z.iso.datetime(),
});
