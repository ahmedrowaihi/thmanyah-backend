import { Module, OnModuleInit, Inject } from "@nestjs/common";
import { ElasticsearchModule as NestElasticsearchModule } from "@nestjs/elasticsearch";
import { config } from "@thmanyah/config";
import { ProgramIndexService } from "./program-index.service";
import { ProgramMapper } from "./mappers/program.mapper";
import { ElasticsearchHealthService } from "./elasticsearch-health.service";
import {
  PROGRAM_INDEX_SERVICE,
  ELASTICSEARCH_HEALTH_SERVICE,
} from "@thmanyah/shared";

@Module({
  imports: [
    NestElasticsearchModule.register({
      node: config.ELASTICSEARCH_URL,
      // Connection settings
      maxRetries: 3,
      requestTimeout: 10000,
      sniffOnStart: false,
      // Note: Authentication is disabled in docker-compose
      // auth: {
      //   username: config.ELASTICSEARCH_USERNAME,
      //   password: config.ELASTICSEARCH_PASSWORD,
      // },
    }),
  ],
  providers: [
    {
      provide: PROGRAM_INDEX_SERVICE,
      useClass: ProgramIndexService,
    },
    {
      provide: ELASTICSEARCH_HEALTH_SERVICE,
      useClass: ElasticsearchHealthService,
    },
    ProgramMapper,
  ],
  exports: [
    NestElasticsearchModule,
    PROGRAM_INDEX_SERVICE,
    ELASTICSEARCH_HEALTH_SERVICE,
    ProgramMapper,
  ],
})
export class ElasticsearchModule implements OnModuleInit {
  constructor(
    @Inject(PROGRAM_INDEX_SERVICE)
    private readonly programIndexService: ProgramIndexService
  ) {}

  async onModuleInit() {
    try {
      // Initialize the index when the module starts
      await this.programIndexService.initializeIndex();
    } catch (error) {
      console.error("Failed to initialize Elasticsearch index:", error);
      // Don't throw here to allow the application to start
      // The service will handle reconnection attempts
    }
  }
}
