import { Injectable, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { config } from "@thmanyah/config";
import {
  IProgramIndexService,
  ProgramDocument,
  SearchFilters,
  SearchPagination,
} from "@thmanyah/shared";
import {
  ElasticsearchBoolQuery,
  ElasticsearchMatchAllQuery,
  ElasticsearchMultiMatchQuery,
  ElasticsearchQuery,
  ElasticsearchSearchQuery,
  ElasticsearchSort,
  ElasticsearchTermQuery,
  ElasticsearchTermsQuery,
} from "./interfaces/elasticsearch.interface";
import { ProgramMapper } from "./mappers/program.mapper";

const INDEX_NAME = config.ELASTICSEARCH_INDEX_NAME || "programs";

@Injectable()
export class ProgramIndexService implements IProgramIndexService {
  private readonly logger = new Logger(ProgramIndexService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly programMapper: ProgramMapper
  ) {}

  async initializeIndex(): Promise<void> {
    const mapping = {
      properties: {
        id: { type: "integer" as const },
        title: { type: "text" as const, analyzer: "standard" },
        description: { type: "text" as const, analyzer: "standard" },
        publishDate: { type: "date" as const },
        type: { type: "keyword" as const },
        language: { type: "keyword" as const },
        tags: { type: "keyword" as const },
        createdAt: { type: "date" as const },
        updatedAt: { type: "date" as const },
      },
    };

    try {
      const exists = await this.elasticsearchService.indices.exists({
        index: INDEX_NAME,
      });

      if (!exists) {
        await this.elasticsearchService.indices.create({
          index: INDEX_NAME,
          mappings: mapping,
        });
        this.logger.log(`Index ${INDEX_NAME} created successfully`);
      } else {
        this.logger.debug(`Index ${INDEX_NAME} already exists`);
      }
    } catch (error) {
      this.logger.error(`Failed to initialize index ${INDEX_NAME}:`, error);
      throw error;
    }
  }

  async indexProgram(program: ProgramDocument): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: INDEX_NAME,
        id: program.id.toString(),
        document: program,
      });
      this.logger.debug(
        `Document ${program.id} indexed successfully in ${INDEX_NAME}`
      );
    } catch (error) {
      this.logger.error(`Failed to index program ${program.id}:`, error);
      throw error;
    }
  }

  async bulkIndexPrograms(programs: ProgramDocument[]): Promise<{
    indexed: number;
    failed: number;
    errors: any[];
  }> {
    const errors: any[] = [];
    let indexed = 0;
    let failed = 0;

    for (const program of programs) {
      try {
        await this.indexProgram(program);
        indexed++;
      } catch (error) {
        failed++;
        errors.push({ programId: program.id, error });
      }
    }

    return { indexed, failed, errors };
  }

  async updateProgram(id: number, updates: any): Promise<void> {
    try {
      await this.elasticsearchService.update({
        index: INDEX_NAME,
        id: id.toString(),
        body: { doc: updates },
      });
      this.logger.debug(`Document ${id} updated successfully in ${INDEX_NAME}`);
    } catch (error) {
      this.logger.error(`Failed to update program ${id}:`, error);
      throw error;
    }
  }

  async deleteProgram(id: number): Promise<void> {
    try {
      await this.elasticsearchService.delete({
        index: INDEX_NAME,
        id: id.toString(),
      });
      this.logger.debug(
        `Document ${id} deleted successfully from ${INDEX_NAME}`
      );
    } catch (error) {
      this.logger.error(`Failed to delete program ${id}:`, error);
      throw error;
    }
  }

  async bulkDeletePrograms(ids: number[]): Promise<{
    deleted: number;
    failed: number;
    errors: any[];
  }> {
    const errors: any[] = [];
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      try {
        await this.deleteProgram(id);
        deleted++;
      } catch (error) {
        failed++;
        errors.push({ programId: id, error });
      }
    }

    return { deleted, failed, errors };
  }

  async searchPrograms(
    query: string,
    filters?: any
  ): Promise<{
    hits: any[];
    total: number;
  }> {
    try {
      const searchQuery = this.buildSearchQuery(query, filters);
      const response = await this.elasticsearchService.search<ProgramDocument>({
        index: INDEX_NAME,
        ...searchQuery,
      });

      const total =
        typeof response.hits.total === "number"
          ? response.hits.total
          : response.hits.total?.value || 0;

      return {
        hits: response.hits.hits.map((hit) => hit._source),
        total,
      };
    } catch (error) {
      this.logger.error(`Search failed on index ${INDEX_NAME}:`, error);
      throw error;
    }
  }

  private buildSearchQuery(
    query: string,
    filters?: SearchFilters,
    pagination?: SearchPagination
  ): ElasticsearchSearchQuery {
    const must: ElasticsearchQuery[] = [];

    // Text search
    if (query && query.trim()) {
      const multiMatchQuery: ElasticsearchMultiMatchQuery = {
        multi_match: {
          query,
          fields: ["title^2", "description", "tags"],
          type: "best_fields",
          fuzziness: "AUTO",
        },
      };
      must.push(multiMatchQuery);
    }

    // Filters
    if (filters?.type) {
      const termQuery: ElasticsearchTermQuery = {
        term: { type: filters.type },
      };
      must.push(termQuery);
    }
    if (filters?.language) {
      const termQuery: ElasticsearchTermQuery = {
        term: { language: filters.language },
      };
      must.push(termQuery);
    }
    if (filters?.tags && filters.tags.length > 0) {
      const termsQuery: ElasticsearchTermsQuery = {
        terms: { tags: filters.tags },
      };
      must.push(termsQuery);
    }

    // Build the query
    let searchQuery: ElasticsearchSearchQuery;

    if (must.length === 0) {
      // No query and no filters - return all documents
      const matchAllQuery: ElasticsearchMatchAllQuery = {
        match_all: {},
      };
      searchQuery = {
        query: matchAllQuery,
      };
    } else {
      // Has query or filters
      const boolQuery: ElasticsearchBoolQuery = {
        bool: {
          must,
        },
      };
      searchQuery = {
        query: boolQuery,
      };
    }

    // Validate and add sorting
    const allowedSortFields = [
      "publishDate",
      "title",
      "createdAt",
      "updatedAt",
    ];
    const sortBy = pagination?.sortBy || "publishDate";

    if (!allowedSortFields.includes(sortBy)) {
      this.logger.warn(
        `Invalid sort field: ${sortBy}, using default: publishDate`
      );
    }

    const sortOrder = pagination?.sortOrder || "desc";
    const sort: ElasticsearchSort = {
      [sortBy]: { order: sortOrder },
    };

    // Add pagination
    const from = pagination?.page
      ? (pagination.page - 1) * (pagination.limit || 10)
      : 0;
    const size = pagination?.limit || 10;

    searchQuery.from = from;
    searchQuery.size = size;
    searchQuery.sort = [sort];

    return searchQuery;
  }
}
