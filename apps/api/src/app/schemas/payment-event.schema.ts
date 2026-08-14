import z from "zod";
import type { PaymentEventType } from "../../../generated/prisma/enums.ts";
import { paymentSchema } from "./payment.schema.ts";

export const findAllPaymentEventsSchema = z.object({
  id: z.uuid(),
  paymentId: z.uuid(),
  type: z.enum([
    "PAYMENT_CREATED",
    "PAYMENT_PROCESSING",
    "PAYMENT_APPROVED",
    "PAYMENT_DECLINED",
    "PAYMENT_CANCELED",
  ] as PaymentEventType[]),
  payload: paymentSchema,
  createdAt: z.iso.date(),
});
