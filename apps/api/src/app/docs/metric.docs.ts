import { openApiSchema } from "../../common/openapi.ts";
import { metricsSchema } from "../schemas/metric.schema.ts";

export const metricDocs = {
  get: {
    summary: "Get metrics",
    description: "Returns overall gateway metrics.",
    tags: ["Metrics"],
    response: {
      200: {
        description: "When the metrics are retrieved successfully.",
        content: {
          "application/json": {
            schema: openApiSchema(metricsSchema),
          },
        },
      },
    },
  },
};
