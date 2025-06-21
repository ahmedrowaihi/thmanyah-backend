import { DataSource } from "typeorm";
import { config } from "@thmanyah/config";
import { Program } from "./entities/program.entity";
import { Outbox } from "./entities/outbox.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.DATABASE_HOST,
  port: config.DATABASE_PORT,
  username: config.DATABASE_USERNAME,
  password: config.DATABASE_PASSWORD,
  database: config.DATABASE_NAME,
  entities: [Program, Outbox],
  migrations: ["src/migrations/*.ts"],
  migrationsRun: false,
  synchronize: config.NODE_ENV === "development",
  logging: config.NODE_ENV === "development",
  ssl: config.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
