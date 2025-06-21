import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Program } from "./entities/program.entity";
import { Outbox } from "./entities/outbox.entity";
import { config } from "@thmanyah/config";
import { DataSourceOptions } from "typeorm";

// Shared configuration object
const sharedConfig = {
  type: "postgres" as const,
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  entities: [Program, Outbox],
  migrations: ["src/migrations/*.ts"],
  synchronize: config.NODE_ENV === "development",
  logging: config.NODE_ENV === "development",
  ssl:
    config.NODE_ENV === "production" && !process.env.DATABASE_SSL_DISABLED
      ? { rejectUnauthorized: false }
      : false,
} satisfies DataSourceOptions;

// For NestJS
export const typeOrmConfig: TypeOrmModuleOptions = sharedConfig;
