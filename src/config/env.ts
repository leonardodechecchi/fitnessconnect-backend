import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_TTL: z.string().transform(Number),
  CLIENT_SIDE_URL: z.string().url(),
  FACEBOOK_CLIENT_ID: z.string(),
  FACEBOOK_CLIENT_SECRET: z.string(),
  FACEBOOK_REDIRECT_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URL: z.string().url(),
  HTTP_PORT: z.string().transform(Number),
  NODE_ENV: z.enum(['production', 'development']),
  POSTGRES_DB: z.string(),
  POSTGRES_PASSWORD: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PASSWORD: z.string(),
  REDIS_PORT: z.string().transform(Number),
  REDIS_USERNAME: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_TTL: z.string().transform(Number),
  STATE_TOKEN_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
