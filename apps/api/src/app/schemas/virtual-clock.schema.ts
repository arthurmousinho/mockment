import { z } from "zod";

export const advanceVirtualClockSchema = z.object({
  minutes: z.number({ message: "O valor deve ser um número." }).optional(),
  hours: z.number({ message: "O valor deve ser um número." }).optional(),
  days: z.number({ message: "O valor deve ser um número." }).optional(),
  weeks: z.number({ message: "O valor deve ser um número." }).optional(),
  months: z.number({ message: "O valor deve ser um número." }).optional(),
  years: z.number({ message: "O valor deve ser um número." }).optional(),
});

export type AdvanceVirtualClockInput = z.infer<
  typeof advanceVirtualClockSchema
>;

export const currentVirtualDateTimeSchema = z.object({
  currentDateTime: z.iso.datetime({
    message: "O valor deve ser uma data válida.",
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
