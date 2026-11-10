import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  HOST: z.string(),
  PORT: z.coerce.number().int().positive(),
  API_VERSION: z.string(),
  WEB_URL: z.url(),
  DATABASE_URL: z.url(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().int().positive(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables");
  console.error(result.error.format());

  process.exit(1);
}

export const env = result.data;

export const API_PREFIX = `/api/${env.API_VERSION}` as const;
