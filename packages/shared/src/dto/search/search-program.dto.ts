import { IsString, IsOptional, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SearchProgramDto {
  @ApiProperty({
    description: "Search query string",
    example: "artificial intelligence",
  })
  @IsString()
  query!: string;

  @ApiProperty({
    description: "Array of filter strings",
    example: ["type:podcast", "language:en"],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  filters?: string[];
}
