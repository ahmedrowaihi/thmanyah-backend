import { Injectable, Logger, Inject } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { IElasticsearchHealthService } from "@thmanyah/shared";

export interface HealthStatus {
  status: "up" | "down";
  message: string;
  timestamp: string;
}

export interface ClusterInfo {
  clusterName?: string;
  version?: string;
  status: "connected" | "disconnected";
  error?: string;
}

@Injectable()
export class ElasticsearchHealthService implements IElasticsearchHealthService {
  private readonly logger = new Logger(ElasticsearchHealthService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.elasticsearchService.ping();
      return !!response;
    } catch (error) {
      this.logger.error("Elasticsearch health check failed:", error);
      return false;
    }
  }

  async getClusterInfo(): Promise<{
    clusterName: string;
    status: string;
    numberOfNodes: number;
  }> {
    try {
      const info = await this.elasticsearchService.info();
      const clusterHealth = await this.elasticsearchService.cluster.health();

      return {
        clusterName: info.cluster_name || "unknown",
        status: clusterHealth.status || "unknown",
        numberOfNodes: clusterHealth.number_of_nodes || 0,
      };
    } catch (error) {
      this.logger.error("Failed to get cluster info:", error);
      return {
        clusterName: "unknown",
        status: "disconnected",
        numberOfNodes: 0,
      };
    }
  }
}
