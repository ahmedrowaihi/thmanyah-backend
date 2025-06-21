import {
  ProgramDocument,
  CreateProgramDocument,
  UpdateProgramDocument,
} from "../../models";

export interface IElasticsearchHealthService {
  isHealthy(): Promise<boolean>;
  getClusterInfo(): Promise<{
    clusterName: string;
    status: string;
    numberOfNodes: number;
  }>;
}

export interface IProgramIndexService {
  indexProgram(program: ProgramDocument): Promise<void>;
  bulkIndexPrograms(programs: ProgramDocument[]): Promise<{
    indexed: number;
    failed: number;
    errors: any[];
  }>;
  updateProgram(id: number, updates: UpdateProgramDocument): Promise<void>;
  deleteProgram(id: number): Promise<void>;
  bulkDeletePrograms(ids: number[]): Promise<{
    deleted: number;
    failed: number;
    errors: any[];
  }>;
  searchPrograms(
    query: string,
    filters?: any
  ): Promise<{
    hits: any[];
    total: number;
  }>;
}
