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

export const setVirtualClockSchema = z.object({
  currentDateTime: z.iso.datetime({
    message: "O valor deve ser uma data válida.",
  }),
});

export type SetVirtualClockInput = z.infer<typeof setVirtualClockSchema>;
