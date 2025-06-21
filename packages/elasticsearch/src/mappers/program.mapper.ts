import { Injectable } from "@nestjs/common";
import { ProgramDocument } from "../interfaces/program-document.interface";
import { Program } from "@thmanyah/database";

@Injectable()
export class ProgramMapper {
  /**
   * Maps a Program entity to a ProgramDocument for Elasticsearch indexing
   */
  toDocument(program: Program): ProgramDocument {
    return {
      id: program.id,
      title: program.title,
      description: program.description,
      publishDate: program.publishDate.toISOString(),
      type: program.type,
      language: program.language,
      tags: program.tags,
      createdAt: program.createdAt.toISOString(),
      updatedAt: program.updatedAt.toISOString(),
    };
  }
}
