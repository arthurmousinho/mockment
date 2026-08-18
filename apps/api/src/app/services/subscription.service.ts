import { prismaSingleton } from "../../config/prisma.ts";
import { apiKeyService } from "./api-key.service.ts";
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
} from "../schemas/subscription.schema.ts";
import type {
  BillingInterval,
  SubscriptionStatus,
} from "../../../generated/prisma/enums.ts";
import { BadRequestError, NotFoundError } from "../../common/http-error.ts";
import { virtualClockService } from "./virtual-clock.service.ts";
import { addDays, addMonths, addWeeks, addYears } from "date-fns";
import { paymentService } from "./payment.service.ts";
import type { PaginationInput } from "../../common/pagination.schema.ts";
import {
  buildPaginatedResponse,
  buildPrismaPaginationParams,
} from "../../common/utils.ts";
import { eventService } from "./event.service.ts";

function calculateNextBillingDate(
  currentDate: Date,
  interval: BillingInterval,
): Date {
  switch (interval) {
    case "DAY":
      return addDays(currentDate, 1);
    case "WEEK":
      return addWeeks(currentDate, 1);
    case "MONTH":
      return addMonths(currentDate, 1);
    case "YEAR":
      return addYears(currentDate, 1);
  }
}

async function create(apiKey: string, input: CreateSubscriptionInput) {
  const validatedApiKey = await apiKeyService.validate(apiKey);

  const pendingSubscription = await prismaSingleton.subscription.create({
    data: {
      apiKeyId: validatedApiKey.id,
      amountInCents: input.amountInCents,
      currency: input.currency,
      method: input.method,
      description: input.description ?? null,
      interval: input.interval,
      intervalCount: 1,
      status: "PENDING",
      nextBillingAt: null,
    },
  });

  const initPayment = await paymentService.create(
    apiKey,
    {
      amountInCents: input.amountInCents,
      currency: input.currency,
      method: input.method,
      description: input.description,
    },
    pendingSubscription.id,
  );

  await eventService.emit({
    subscriptionId: pendingSubscription.id,
    type: "SUBSCRIPTION_CREATED",
    payload: pendingSubscription,
  });

  return {
    ...pendingSubscription,
    checkoutLink: initPayment.checkoutLink,
  };
}

async function findAll(paginationInput: PaginationInput) {
  const { skip, take } = buildPrismaPaginationParams(paginationInput);
  const [subscriptions, total] = await Promise.all([
    prismaSingleton.subscription.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
    }),
    prismaSingleton.subscription.count(),
  ]);
  return buildPaginatedResponse({
    data: subscriptions,
    page: paginationInput.page,
    limit: paginationInput.limit,
    total,
  });
}

async function findById(id: string) {
  const subscription = await prismaSingleton.subscription.findUnique({
    where: { id },
  });

  if (!subscription) {
    throw new NotFoundError(`Subscription with ID ${id} was not found.`);
  }

  return subscription;
}

async function getDetails(id: string) {
  const subscription = await prismaSingleton.subscription.findUnique({
    where: { id },
    include: {
      events: {
        select: {
          id: true,
          type: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!subscription) {
    throw new NotFoundError(`Subscription with ID ${id} was not found.`);
  }

  return subscription;
}

function validateStatusTransition(
  currentStatus: SubscriptionStatus,
  newStatus: SubscriptionStatus,
) {
  const validTransitions: Record<SubscriptionStatus, SubscriptionStatus[]> = {
    ACTIVE: ["PAUSED", "CANCELED"],
    PAUSED: ["ACTIVE", "CANCELED"],
    PENDING: ["CANCELED"], // PEDING -> ACTIVE only through activate function
    CANCELED: [],
  };
  const allowed = validTransitions[currentStatus];
  if (!allowed.includes(newStatus)) {
    throw new BadRequestError(
      `Cannot change subscription status from ${currentStatus} to ${newStatus}.`,
    );
  }
}

async function changeStatus(id: string, newStatus: SubscriptionStatus) {
  const subscription = await findById(id);
  validateStatusTransition(subscription.status, newStatus);
  return await prismaSingleton.subscription.update({
    where: { id: subscription.id },
    data: { status: newStatus },
  });
}

async function activate(id: string) {
  const subscription = await findById(id);

  if (subscription.status !== "PENDING") {
    throw new BadRequestError(
      `Only PENDING subscriptions can be activated. Current status: ${subscription.status}.`,
    );
  }

  const now = await virtualClockService.now();
  const nextBillingAt = calculateNextBillingDate(now, subscription.interval);

  const activatedSubscription = await prismaSingleton.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      status: "ACTIVE",
      nextBillingAt,
    },
  });

  await eventService.emit({
    subscriptionId: activatedSubscription.id,
    type: "SUBSCRIPTION_ACTIVATED",
    payload: activatedSubscription,
  });

  return activatedSubscription;
}

async function update(id: string, input: UpdateSubscriptionInput) {
  const subscription = await findById(id);
  return await prismaSingleton.subscription.update({
    where: { id: subscription.id },
    data: {
      ...(input.amountInCents && { amountInCents: input.amountInCents }),
      ...(input.currency && { currency: input.currency }),
      ...(input.method && { method: input.method }),
      ...(input.description && { description: input.description }),
      ...(input.interval !== undefined && {
        interval: input.interval,
        nextBillingAt: subscription.nextBillingAt
          ? calculateNextBillingDate(subscription.nextBillingAt, input.interval)
          : null,
      }),
    },
  });
}

async function processDueSubscriptions() {
  const now = await virtualClockService.now();

  const dueSubscriptions = await prismaSingleton.subscription.findMany({
    where: {
      status: "ACTIVE",
      nextBillingAt: { lte: now },
    },
  });

  let paymentsCreated = 0;

  for (const subscription of dueSubscriptions) {
    if (!subscription.nextBillingAt) continue;
    let nextBillingAt = subscription.nextBillingAt;

    while (nextBillingAt <= now) {
      await paymentService.createRecurringPayment(subscription);
      nextBillingAt = calculateNextBillingDate(
        nextBillingAt,
        subscription.interval,
      );
      await prismaSingleton.subscription.update({
        where: { id: subscription.id },
        data: { nextBillingAt },
      });
      paymentsCreated++;
    }
  }

  return {
    processedSubscriptions: dueSubscriptions.length,
    paymentsCreated,
  };
}

export const subscriptionService = {
  create,
  findAll,
  changeStatus,
  update,
  activate,
  processDueSubscriptions,
  getDetails,
};
