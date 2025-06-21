import { IsString, IsDateString, IsArray, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateProgramDto {
  @ApiProperty({
    description: "The title of the program",
    example: "Introduction to AI",
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "The description of the program",
    example: "A comprehensive introduction to artificial intelligence concepts",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "The publish date of the program",
    example: "2024-01-15",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiProperty({
    description: "The type of the program",
    example: "podcast",
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: "The language of the program",
    example: "en",
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: "Tags associated with the program",
    example: ["technology", "ai", "future"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
