export interface IQueueService {
  addJob<T = any>(
    jobType: string,
    data: T,
    options?: {
      delay?: number;
      priority?: number;
    }
  ): Promise<void>;
  processJob<T = any>(
    jobType: string,
    handler: (data: T) => Promise<void>
  ): void;
}
