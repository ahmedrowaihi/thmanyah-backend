import { IsString, IsNotEmpty, IsDateString, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProgramDto {
  @ApiProperty({
    description: "The title of the program",
    example: "The Future of AI",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "The description of the program",
    example:
      "An in-depth exploration of artificial intelligence and its impact on society",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: "The publish date of the program",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsDateString()
  publishDate!: string;

  @ApiProperty({
    description: "The type of program",
    example: "podcast",
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: "The language of the program",
    example: "en",
  })
  @IsString()
  @IsNotEmpty()
  language!: string;

  @ApiProperty({
    description: "Tags associated with the program",
    example: ["technology", "ai", "future"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];
}
