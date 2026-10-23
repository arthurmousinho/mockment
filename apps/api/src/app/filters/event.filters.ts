import { EventType } from "../../../generated/prisma/enums.ts";
import type { EventWhereInput } from "../../../generated/prisma/models/Event.ts";
import { buildSearchFilter } from "../../common/search.ts";

export function buildEventSearchFilter(search?: string): EventWhereInput {
  return buildSearchFilter<EventWhereInput>(search, [
    (term) => ({ id: { contains: term } }),
    (term) => ({ paymentId: { contains: term } }),
    (term) => ({ subscriptionId: { contains: term } }),
    (term) => ({
      type: {
        in: Object.values(EventType).filter((type) =>
          type.includes(term.toUpperCase().replace(/\s+/g, "_")),
        ),
      },
    }),
  ]);
}
