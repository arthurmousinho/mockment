import { z } from "zod";

export const advanceVirtualClockSchema = z.object({
  minutes: z.number({ message: "Value must be a number." }).optional(),
  hours: z.number({ message: "Value must be a number." }).optional(),
  days: z.number({ message: "Value must be a number." }).optional(),
  weeks: z.number({ message: "Value must be a number." }).optional(),
  months: z.number({ message: "Value must be a number." }).optional(),
  years: z.number({ message: "Value must be a number." }).optional(),
});

export type AdvanceVirtualClockInput = z.infer<
  typeof advanceVirtualClockSchema
>;

export const currentVirtualDateTimeSchema = z.object({
  currentDateTime: z.iso.datetime({
    message: "Value must be a valid date and time.",
  }),
});

export type CurrentVirtualDateTimeInput = z.infer<
  typeof currentVirtualDateTimeSchema
>;

export const setVirtualClockResponseSchema = z.object({
  id: z.string().default("default"),
  currentDateTime: z.iso.datetime(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  processedSubscriptions: z.number().int().positive(),
  paymentsCreated: z.number().int().positive(),
});
