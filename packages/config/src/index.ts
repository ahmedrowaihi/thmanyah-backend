import { z } from "zod";

// Environment-specific configuration requirements
const environmentRequirements = {
  development: {
    required: ["NODE_ENV"],
    recommended: [
      "DATABASE_HOST",
      "DATABASE_PORT",
      "DATABASE_USERNAME",
      "DATABASE_PASSWORD",
      "DATABASE_NAME",
    ],
  },
  test: {
    required: ["NODE_ENV"],
    recommended: [
      "DATABASE_HOST",
      "DATABASE_PORT",
      "DATABASE_USERNAME",
      "DATABASE_PASSWORD",
      "DATABASE_NAME",
    ],
  },
  production: {
    required: [
      "NODE_ENV",
      "DATABASE_HOST",
      "DATABASE_PORT",
      "DATABASE_USERNAME",
      "DATABASE_PASSWORD",
      "DATABASE_NAME",
      "REDIS_HOST",
      "REDIS_PORT",
      "ELASTICSEARCH_URL",
    ],
    recommended: [
      "REDIS_PASSWORD",
      "ELASTICSEARCH_USERNAME",
      "ELASTICSEARCH_PASSWORD",
    ],
  },
} as const;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database - Required in production, optional in dev/test with defaults
  DATABASE_HOST: z.string().default("localhost"),
  DATABASE_PORT: z.string().transform(Number).default("5432"),
  DATABASE_USERNAME: z.string().default("postgres"),
  DATABASE_PASSWORD: z.string().default("password"),
  DATABASE_NAME: z.string().default("thmanyah"),

  // Redis - Required in production, optional in dev/test with defaults
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().transform(Number).default("6379"),
  REDIS_PASSWORD: z.string().optional(),

  // Elasticsearch - Required in production, optional in dev/test with defaults
  ELASTICSEARCH_URL: z.string().default("http://localhost:9200"),
  ELASTICSEARCH_USERNAME: z.string().default("elastic"),
  ELASTICSEARCH_PASSWORD: z.string().default("changeme"),
  ELASTICSEARCH_INDEX_NAME: z.string().default("programs"),

  // API Ports - Always have defaults
  CMS_API_PORT: z.string().transform(Number).default("3001"),
  DISCOVERY_API_PORT: z.string().transform(Number).default("3002"),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    const config = envSchema.parse(process.env);
    const env = config.NODE_ENV;
    const requirements = environmentRequirements[env];

    // Validate required environment variables
    validateRequiredEnvVars(config, requirements.required, env);

    // Warn about missing recommended variables
    validateRecommendedEnvVars(config, requirements.recommended, env);

    // Additional production validation
    if (env === "production") {
      validateProductionConfig(config);
    }

    // Log configuration summary
    logConfigurationSummary(config, env);

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

function validateRequiredEnvVars(
  config: EnvConfig,
  required: readonly string[],
  env: string
): void {
  const missing: string[] = [];

  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables for ${env} environment:`
    );
    missing.forEach((varName) => {
      console.error(`  - ${varName}`);
    });
    console.error(
      `\n💡 Please set these environment variables before running the application.`
    );
    process.exit(1);
  }
}

function validateRecommendedEnvVars(
  config: EnvConfig,
  recommended: readonly string[],
  env: string
): void {
  const missing: string[] = [];

  for (const varName of recommended) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  Recommended environment variables not set for ${env} environment:`
    );
    missing.forEach((varName) => {
      console.warn(`  - ${varName} (using default value)`);
    });
    console.warn(
      `💡 Consider setting these for better configuration control.\n`
    );
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

function logConfigurationSummary(config: EnvConfig, env: string): void {
  console.log(`\n🔧 Configuration Summary (${env} environment):`);
  console.log(
    `  📊 Database: ${config.DATABASE_HOST}:${config.DATABASE_PORT}/${config.DATABASE_NAME}`
  );
  console.log(`  🔴 Redis: ${config.REDIS_HOST}:${config.REDIS_PORT}`);
  console.log(`  🔍 Elasticsearch: ${config.ELASTICSEARCH_URL}`);
  console.log(
    `  🚀 API Ports: CMS(${config.CMS_API_PORT}), Discovery(${config.DISCOVERY_API_PORT})`
  );

  if (env === "development" || env === "test") {
    console.log(
      `  💡 Using default values for development/testing. Set environment variables for customization.`
    );
  }
  console.log("");
}

export const config = validateEnv();
