import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1750537322316 implements MigrationInterface {
    name = 'InitialMigration1750537322316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "programs" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "publishDate" TIMESTAMP NOT NULL, "type" character varying NOT NULL, "language" character varying NOT NULL, "tags" text array NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d43c664bcaafc0e8a06dfd34e05" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventType" character varying NOT NULL, "payload" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "processed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TABLE "programs"`);
    }

}
