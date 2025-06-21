import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("outbox")
export class Outbox {
  @ApiProperty({
    description: "The unique identifier of the outbox event",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({
    description: "The type of event",
    example: "PROGRAM_CREATED",
  })
  @Column()
  eventType!: string;

  @ApiProperty({
    description: "The event payload data",
    example: { programId: 1 },
  })
  @Column({ type: "jsonb" })
  payload!: any;

  @ApiProperty({
    description: "The creation timestamp",
    example: "2024-01-15T10:00:00.000Z",
  })
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @ApiProperty({
    description: "Whether the event has been processed",
    example: false,
  })
  @Column({ default: false })
  processed!: boolean;
}
