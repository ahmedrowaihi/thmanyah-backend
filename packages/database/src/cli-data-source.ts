import { DataSource } from "typeorm";
import { config } from "@thmanyah/config";
import { Program } from "./entities/program.entity";
import { Outbox } from "./entities/outbox.entity";

export const CliDataSource = new DataSource({
  type: "postgres",
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  entities: [Program, Outbox],
  migrations: ["dist/migrations/*.js"],
  migrationsRun: false,
  synchronize: false,
  logging: true,
  ssl:
    config.NODE_ENV === "production" && !process.env.DATABASE_SSL_DISABLED
      ? { rejectUnauthorized: false }
      : false,
});
