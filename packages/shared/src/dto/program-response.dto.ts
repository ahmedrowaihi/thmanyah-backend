import { ApiProperty } from "@nestjs/swagger";

export class ProgramResponseDto {
  @ApiProperty({
    description: "The unique identifier of the program",
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: "The title of the program",
    example: "The Future of AI",
  })
  title!: string;

  @ApiProperty({
    description: "The description of the program",
    example:
      "An in-depth exploration of artificial intelligence and its impact on society",
  })
  description!: string;

  @ApiProperty({
    description: "The publish date of the program",
    example: "2024-01-15T10:00:00.000Z",
  })
  publishDate!: string;

  @ApiProperty({
    description: "The type of program",
    example: "podcast",
  })
  type!: string;

  @ApiProperty({
    description: "The language of the program",
    example: "en",
  })
  language!: string;

  @ApiProperty({
    description: "Tags associated with the program",
    example: ["technology", "ai", "future"],
    type: [String],
  })
  tags!: string[];

  @ApiProperty({
    description: "The creation timestamp",
    example: "2024-01-15T10:00:00.000Z",
  })
  createdAt!: string;

  @ApiProperty({
    description: "The last update timestamp",
    example: "2024-01-15T10:00:00.000Z",
  })
  updatedAt!: string;
}
