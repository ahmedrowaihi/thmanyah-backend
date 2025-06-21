import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity("programs")
export class Program {
  @ApiProperty({
    description: "The unique identifier of the program",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: "The title of the program",
    example: "The Future of AI",
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: "The description of the program",
    example:
      "An in-depth exploration of artificial intelligence and its impact on society",
  })
  @Column({ type: "text" })
  description!: string;

  @ApiProperty({
    description: "The publish date of the program",
    example: "2024-01-15T10:00:00.000Z",
  })
  @Column({ type: "timestamp" })
  publishDate!: Date;

  @ApiProperty({
    description: "The type of program",
    example: "podcast",
  })
  @Column()
  type!: string;

  @ApiProperty({
    description: "The language of the program",
    example: "en",
  })
  @Column()
  language!: string;

  @ApiProperty({
    description: "Tags associated with the program",
    example: ["technology", "ai", "future"],
    type: [String],
  })
  @Column({ type: "text", array: true })
  tags!: string[];

  @ApiProperty({
    description: "The creation timestamp",
    example: "2024-01-15T10:00:00.000Z",
  })
  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @ApiProperty({
    description: "The last update timestamp",
    example: "2024-01-15T10:00:00.000Z",
  })
  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
