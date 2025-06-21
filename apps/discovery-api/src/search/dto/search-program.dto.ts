import {
  IsString,
  IsOptional,
  IsArray,
  IsString as IsStringArray,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class SearchProgramDto {
  @ApiProperty({
    description: 'Search query',
    example: 'artificial intelligence',
    required: false,
  })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiProperty({
    description: 'Filter by program type',
    example: 'podcast',
    required: false,
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({
    description: 'Filter by language',
    example: 'en',
    required: false,
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty({
    description: 'Filter by tags (comma-separated)',
    example: 'technology,ai,future',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((tag: string) => tag.trim());
    }
    return undefined;
  })
  @IsArray()
  @IsStringArray({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of results per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    example: 'publishDate',
    enum: ['publishDate', 'title', 'score', 'createdAt'],
    default: 'publishDate',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'publishDate' | 'title' | 'score' | 'createdAt' = 'publishDate';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
