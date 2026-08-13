import { openApiSchema } from "../../common/openapi.ts";
import {
  advanceVirtualClockSchema,
  setVirtualClockSchema,
} from "../schemas/virtual-clock.schema.ts";

export const virtualClockDocs = {
  get: {
    summary: "Get virtual clock",
    description: "Returns the current virtual date and time.",
    tags: ["Virtual Clock"],
  },
  advance: {
    summary: "Advance virtual clock",
    description: "Advances the virtual clock by the specified amount of time.",
    tags: ["Virtual Clock"],
    body: openApiSchema(advanceVirtualClockSchema),
  },
  reset: {
    summary: "Reset virtual clock",
    description: "Resets the virtual clock to its initial date and time.",
    tags: ["Virtual Clock"],
  },
  set: {
    summary: "Set virtual clock",
    description: "Sets the virtual clock to a specific date and time.",
    tags: ["Virtual Clock"],
    body: openApiSchema(setVirtualClockSchema),
  },
};
