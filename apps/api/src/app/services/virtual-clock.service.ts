import {
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  addYears,
} from "date-fns";
import { prismaSingleton } from "../../config/prisma.ts";
import type {
  AdvanceVirtualClockInput,
  CurrentVirtualDateTimeInput,
} from "../schemas/virtual-clock.schema.ts";
import { subscriptionService } from "./subscription.service.ts";

const CLOCK_ID = "default";

async function initialize() {
  await prismaSingleton.virtualClock.upsert({
    where: { id: CLOCK_ID },
    update: {},
    create: {
      id: CLOCK_ID,
      currentDateTime: new Date(),
    },
  });
}

async function tickOneMinute() {
  const currentNow = await now();
  const nextTick = addMinutes(currentNow, 1);

  return await prismaSingleton.virtualClock.update({
    where: { id: CLOCK_ID },
    data: { currentDateTime: nextTick },
  });
}

async function now(): Promise<Date> {
  const clock = await prismaSingleton.virtualClock.findUniqueOrThrow({
    where: { id: CLOCK_ID },
  });
  return clock.currentDateTime;
}

async function set(input: CurrentVirtualDateTimeInput) {
  const clock = await prismaSingleton.virtualClock.update({
    where: { id: CLOCK_ID },
    data: { currentDateTime: input.currentDateTime },
  });

  const processedSubscriptions =
    await subscriptionService.processDueSubscriptions();

  return { ...clock, ...processedSubscriptions };
}

async function advance({
  minutes = 0,
  hours = 0,
  days = 0,
  weeks = 0,
  months = 0,
  years = 0,
}: AdvanceVirtualClockInput) {
  const currentDateTime = await now();
  let nextDate = currentDateTime;

  nextDate = addMinutes(nextDate, minutes);
  nextDate = addHours(nextDate, hours);
  nextDate = addDays(nextDate, days);
  nextDate = addWeeks(nextDate, weeks);
  nextDate = addMonths(nextDate, months);
  nextDate = addYears(nextDate, years);

  const clock = await prismaSingleton.virtualClock.update({
    where: { id: CLOCK_ID },
    data: { currentDateTime: nextDate },
  });

  const processedSubscriptions =
    await subscriptionService.processDueSubscriptions();

  return { ...clock, ...processedSubscriptions };
}

async function reset(): Promise<Date> {
  const clock = await prismaSingleton.virtualClock.update({
    where: { id: CLOCK_ID },
    data: { currentDateTime: new Date() },
  });
  return clock.currentDateTime;
}

export const virtualClockService = {
  initialize,
  tickOneMinute,
  now,
  set,
  advance,
  reset,
};
