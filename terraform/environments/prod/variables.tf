variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "thmanyah-backend"
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
  default     = "prod"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# Database configuration
variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "thmanyah"
}

variable "db_user" {
  description = "Username for the database"
  type        = string
  default     = "thmanyah_admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Port for the database"
  type        = number
  default     = 5432
}

variable "db_instance_class" {
  description = "Instance class for the RDS instance"
  type        = string
  default     = "db.t3.small"
}

variable "db_allocated_storage" {
  description = "Allocated storage for the RDS instance in GB"
  type        = number
  default     = 100
}

# Redis configuration
variable "redis_node_type" {
  description = "Node type for Redis cluster"
  type        = string
  default     = "cache.t3.small"
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}

variable "redis_password_arn" {
  description = "ARN of the secret containing the Redis password"
  type        = string
}

# Elasticsearch configuration
variable "elasticsearch_instance_type" {
  description = "Instance type for OpenSearch nodes"
  type        = string
  default     = "t3.medium.search"
}

variable "elasticsearch_instance_count" {
  description = "Number of OpenSearch instances"
  type        = number
  default     = 2
}

variable "elasticsearch_volume_size" {
  description = "Volume size for OpenSearch in GB"
  type        = number
  default     = 50
}

variable "elasticsearch_username" {
  description = "Username for OpenSearch"
  type        = string
  default     = "admin"
}

variable "elasticsearch_password" {
  description = "Elasticsearch password"
  type        = string
  sensitive   = true
}

variable "elasticsearch_index_name" {
  description = "Name of the OpenSearch index"
  type        = string
  default     = "programs"
}

# ECS configuration - Container images
variable "cms_api_image" {
  description = "Docker image for CMS API"
  type        = string
}

variable "discovery_api_image" {
  description = "Docker image for Discovery API"
  type        = string
}

variable "outbox_publisher_image" {
  description = "Docker image for Outbox Publisher"
  type        = string
}

variable "sync_worker_image" {
  description = "Docker image for Sync Worker"
  type        = string
}

# Service ports
variable "cms_api_port" {
  description = "Port that the CMS API listens on"
  type        = number
  default     = 3001
}

variable "discovery_api_port" {
  description = "Port that the Discovery API listens on"
  type        = number
  default     = 3002
}

# Task resources
variable "task_cpu" {
  description = "CPU units for the ECS task"
  type        = number
  default     = 512
}

variable "task_memory" {
  description = "Memory for the ECS task in MB"
  type        = number
  default     = 1024
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
} 