import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.string().transform(Number).default("5432"),
  DATABASE_USERNAME: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string().default("password"),
  DATABASE_NAME: z.string().default("thmanyah"),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Elasticsearch
  ELASTICSEARCH_URL: z.string().default("http://localhost:9200"),
  ELASTICSEARCH_USERNAME: z.string().default("elastic"),
  ELASTICSEARCH_PASSWORD: z.string().default("changeme"),
  ELASTICSEARCH_INDEX_NAME: z.string().default("programs"),

  // API Ports
  CMS_API_PORT: z.string().transform(Number).default("3001"),
  DISCOVERY_API_PORT: z.string().transform(Number).default("3002"),
  OUTBOX_PUBLISHER_PORT: z.string().transform(Number).default("3003"),
  SYNC_WORKER_PORT: z.string().transform(Number).default("3004"),

  // Security
  CORS_ORIGINS: z.string().optional(),
  API_RATE_LIMIT: z.string().transform(Number).default("100"),
  API_RATE_LIMIT_TTL: z.string().transform(Number).default("60000"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    const config = envSchema.parse(process.env);

    // Additional production validation
    if (config.NODE_ENV === "production") {
      validateProductionConfig(config);
    }

    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else {
      console.error("❌ Invalid environment variables:", error);
    }
    process.exit(1);
  }
}

function validateProductionConfig(config: EnvConfig): void {
  const warnings: string[] = [];

  // Check for default passwords in production
  if (config.DATABASE_PASSWORD === "password") {
    warnings.push(
      "DATABASE_PASSWORD should be changed from default in production"
    );
  }

  if (config.ELASTICSEARCH_PASSWORD === "changeme") {
    warnings.push(
      "ELASTICSEARCH_PASSWORD should be changed from default in production"
    );
  }

  // Check for localhost URLs in production
  if (config.DATABASE_HOST === "localhost") {
    warnings.push("DATABASE_HOST should not be localhost in production");
  }

  if (config.REDIS_HOST === "localhost") {
    warnings.push("REDIS_HOST should not be localhost in production");
  }

  if (config.ELASTICSEARCH_URL.includes("localhost")) {
    warnings.push("ELASTICSEARCH_URL should not be localhost in production");
  }

  if (warnings.length > 0) {
    console.warn("⚠️  Production configuration warnings:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
  }
}

export const config = validateEnv();
