import { IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateProgramDto } from "../program";

export class BulkCreateProgramDto {
  @ApiProperty({
    description: "Array of programs to create",
    type: [CreateProgramDto],
    example: [
      {
        title: "Introduction to AI",
        description:
          "A comprehensive introduction to artificial intelligence concepts",
        publishDate: "2024-01-15",
        type: "podcast",
        language: "en",
        tags: ["technology", "ai", "future"],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProgramDto)
  programs!: CreateProgramDto[];
}
