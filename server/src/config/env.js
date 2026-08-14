import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  CLIENT_ORIGIN: z.url("Must be a valid URL").default("http://localhost:5173"),
  DATABASE_URL: z
    .string()
    .refine(
      (value) => /^postgres(ql)?:\/\//.test(value),
      "Must be a postgres:// connection string",
    ),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(32, "Must be at least 32 characters"),
  JWT_ACCESS_TOKEN_TTL: z.string().min(1, "Required").default("1h"),
  JWT_GAME_SESSION_SECRET: z
    .string()
    .min(32, "Must be at least 32 characters"),
  JWT_GAME_SESSION_TTL: z.string().min(1, "Required").default("10m"),
  PASSWORD_RESET_TOKEN_TTL_MINUTES: z.coerce
    .number()
    .int()
    .positive()
    .default(30),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const details = result.error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  // Exit instead of throwing: a stack trace pointing into this module tells you
  // nothing the message does not, and boot must fail loudly rather than start
  // with half a configuration.
  console.error(
    `Invalid environment configuration:\n${details}\n\nSee .env.example for the expected values.`,
  );
  process.exit(1);
}

export const env = {
  nodeEnv: result.data.NODE_ENV,
  port: result.data.PORT,
  clientOrigin: result.data.CLIENT_ORIGIN,
  databaseUrl: result.data.DATABASE_URL,
  jwtAccessTokenSecret: result.data.JWT_ACCESS_TOKEN_SECRET,
  jwtAccessTokenTtl: result.data.JWT_ACCESS_TOKEN_TTL,
  jwtGameSessionSecret: result.data.JWT_GAME_SESSION_SECRET,
  jwtGameSessionTtl: result.data.JWT_GAME_SESSION_TTL,
  passwordResetTokenTtlMinutes: result.data.PASSWORD_RESET_TOKEN_TTL_MINUTES,
};

export const isProduction = env.nodeEnv === "production";
