import { Injectable } from '@nestjs/common';
import {
  Program,
  CreateProgramDto,
  UpdateProgramDto,
  ProgramResponseDto,
} from '~/common';

@Injectable()
export class ProgramMapper {
  /**
   * Validates and parses date string
   */
  private parseDate(dateString: string): Date {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    return date;
  }

  /**
   * Maps CreateProgramDto to Program entity
   */
  toEntity(createDto: CreateProgramDto): Partial<Program> {
    return {
      title: createDto.title,
      description: createDto.description,
      publishDate: this.parseDate(createDto.publishDate),
      type: createDto.type,
      language: createDto.language,
      tags: createDto.tags,
    };
  }

  /**
   * Maps UpdateProgramDto to partial Program entity
   */
  toPartialEntity(updateDto: UpdateProgramDto): Partial<Program> {
    const partial: Partial<Program> = {};

    if (updateDto.title !== undefined) partial.title = updateDto.title;
    if (updateDto.description !== undefined)
      partial.description = updateDto.description;
    if (updateDto.publishDate !== undefined)
      partial.publishDate = this.parseDate(updateDto.publishDate);
    if (updateDto.type !== undefined) partial.type = updateDto.type;
    if (updateDto.language !== undefined) partial.language = updateDto.language;
    if (updateDto.tags !== undefined) partial.tags = updateDto.tags;

    return partial;
  }

  /**
   * Maps Program entity to ProgramResponseDto
   */
  toResponseDto(program: Program): ProgramResponseDto {
    const responseDto = new ProgramResponseDto();
    responseDto.id = program.id;
    responseDto.title = program.title;
    responseDto.description = program.description;
    responseDto.publishDate = program.publishDate.toISOString();
    responseDto.type = program.type;
    responseDto.language = program.language;
    responseDto.tags = program.tags;
    responseDto.createdAt = program.createdAt.toISOString();
    responseDto.updatedAt = program.updatedAt.toISOString();
    return responseDto;
  }

  /**
   * Maps array of Program entities to ProgramResponseDto array
   */
  toResponseDtos(programs: Program[]): ProgramResponseDto[] {
    return programs.map((program) => this.toResponseDto(program));
  }
}
