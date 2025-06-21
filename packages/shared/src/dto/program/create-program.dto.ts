import { IsString, IsDateString, IsArray, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProgramDto {
  @ApiProperty({
    description: "The title of the program",
    example: "Introduction to AI",
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: "The description of the program",
    example: "A comprehensive introduction to artificial intelligence concepts",
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: "The publish date of the program",
    example: "2024-01-15",
  })
  @IsDateString()
  publishDate!: string;

  @ApiProperty({
    description: "The type of the program",
    example: "podcast",
  })
  @IsString()
  type!: string;

  @ApiProperty({
    description: "The language of the program",
    example: "en",
  })
  @IsString()
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
