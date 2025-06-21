import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsDateString, IsArray, IsOptional } from "class-validator";

export class UpdateProgramDto {
  @ApiPropertyOptional({
    description: "The title of the program",
    example: "The Future of AI",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: "The description of the program",
    example:
      "An in-depth exploration of artificial intelligence and its impact on society",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: "The publish date of the program",
    example: "2024-01-15T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiPropertyOptional({
    description: "The type of program",
    example: "podcast",
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: "The language of the program",
    example: "en",
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: "Tags associated with the program",
    example: ["technology", "ai", "future"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
