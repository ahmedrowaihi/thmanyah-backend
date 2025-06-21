// Job types for queue processing
export const JOB_TYPES = {
  SYNC_PROGRAM_TO_ELASTICSEARCH: "sync-program-to-elasticsearch",
  DELETE_PROGRAM_FROM_ELASTICSEARCH: "delete-program-from-elasticsearch",
  BULK_SYNC_PROGRAMS: "bulk-sync-programs",
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

// Job data interfaces
export interface SyncProgramJobData {
  programId: number;
}

export interface DeleteProgramJobData {
  programId: number;
}

export interface BulkSyncProgramsJobData {
  programIds: number[];
}
