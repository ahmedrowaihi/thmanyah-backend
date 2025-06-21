/**
 * Internal Elasticsearch interfaces used within the elasticsearch package
 */

import { ProgramDocument } from "./program-document.interface";

export interface ElasticsearchHit<T = ProgramDocument> {
  _index: string;
  _type?: string; // Optional in newer versions
  _id: string;
  _score: number;
  _source: T;
}

export interface ElasticsearchHits<T = ProgramDocument> {
  total: {
    value: number;
    relation: "eq" | "gte";
  };
  max_score: number | null;
  hits: ElasticsearchHit<T>[];
}

export interface ElasticsearchSearchResponse<T = ProgramDocument> {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: ElasticsearchHits<T>;
}

export interface ElasticsearchIndexResponse {
  _index: string;
  _id: string;
  _version: number;
  result: "created" | "updated" | "deleted" | "noop";
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

export interface ElasticsearchDeleteResponse {
  _index: string;
  _id: string;
  _version: number;
  result: "deleted" | "not_found";
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
  _seq_no: number;
  _primary_term: number;
}

// Elasticsearch Query Types
export interface ElasticsearchMatchAllQuery {
  match_all: Record<string, never>;
}

export interface ElasticsearchMultiMatchQuery {
  multi_match: {
    query: string;
    fields: string[];
    type?:
      | "best_fields"
      | "most_fields"
      | "cross_fields"
      | "phrase"
      | "phrase_prefix"
      | "bool_prefix";
    fuzziness?: "AUTO" | "0" | "1" | "2";
  };
}

export interface ElasticsearchTermQuery {
  term: Record<string, string | number | boolean>;
}

export interface ElasticsearchTermsQuery {
  terms: Record<string, (string | number | boolean)[]>;
}

export interface ElasticsearchBoolQuery {
  bool: {
    must?: ElasticsearchQuery[];
    should?: ElasticsearchQuery[];
    must_not?: ElasticsearchQuery[];
    filter?: ElasticsearchQuery[];
  };
}

export type ElasticsearchQuery =
  | ElasticsearchMatchAllQuery
  | ElasticsearchMultiMatchQuery
  | ElasticsearchTermQuery
  | ElasticsearchTermsQuery
  | ElasticsearchBoolQuery;

export interface ElasticsearchSort {
  [field: string]: {
    order: "asc" | "desc";
  };
}

export interface ElasticsearchSearchQuery {
  query: ElasticsearchQuery;
  sort?: ElasticsearchSort[];
  from?: number;
  size?: number;
}
