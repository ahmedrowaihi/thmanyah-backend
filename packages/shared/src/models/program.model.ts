// Core program data structure
export interface ProgramData {
  title: string;
  description: string;
  publishDate: Date;
  type: string;
  language: string;
  tags: string[];
}

// Database entity interface (includes system fields)
export interface Program extends ProgramData {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Elasticsearch document interface (uses ISO strings for dates)
export interface ProgramDocument {
  id: number;
  title: string;
  description: string;
  publishDate: string; // ISO string for Elasticsearch
  type: string;
  language: string;
  tags: string[];
  createdAt: string; // ISO string for Elasticsearch
  updatedAt: string; // ISO string for Elasticsearch
}

// Type for creating/updating program documents in Elasticsearch
export interface CreateProgramDocument {
  title: string;
  description: string;
  publishDate: string;
  type: string;
  language: string;
  tags: string[];
}

// Type for partial updates to program documents
export interface UpdateProgramDocument {
  title?: string;
  description?: string;
  publishDate?: string;
  type?: string;
  language?: string;
  tags?: string[];
}
