variable "app_name" {
  description = "Name of the application"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC"
  type        = string
}

variable "subnet_ids" {
  description = "List of private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for ALB"
  type        = list(string)
}

# ECS configuration
variable "cpu" {
  description = "CPU units for ECS tasks"
  type        = string
  default     = "256"
}

variable "memory" {
  description = "Memory for ECS tasks in MB"
  type        = string
  default     = "512"
}

variable "desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1
}

# Database configuration
variable "db_endpoint" {
  description = "Database endpoint"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "Database port"
  type        = string
}

# Redis configuration (optional)
variable "redis_endpoint" {
  description = "Redis endpoint"
  type        = string
  default     = null
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
  default     = null
}

variable "redis_port" {
  description = "Redis port"
  type        = string
}

# Elasticsearch configuration (optional)
variable "elasticsearch_endpoint" {
  description = "Elasticsearch endpoint"
  type        = string
  default     = null
}

variable "elasticsearch_username" {
  description = "Elasticsearch username"
  type        = string
  default     = null
}

variable "elasticsearch_password" {
  description = "Elasticsearch password"
  type        = string
  sensitive   = true
  default     = null
}

# External Elasticsearch configuration (optional)
variable "enable_external_elasticsearch" {
  description = "Enable external Elasticsearch service"
  type        = bool
  default     = false
}

variable "external_elasticsearch_url" {
  description = "External Elasticsearch URL"
  type        = string
  default     = "https://es.sudorw.com"
}

# ECR repositories
variable "ecr_repository_names" {
  description = "ECR repository names for each service"
  type        = list(string)
  default     = ["cms-api", "discovery-api", "outbox-publisher", "sync-worker"]
}

# Docker image tags
variable "docker_image_tags" {
  description = "Docker image tags for each service"
  type        = map(string)
  default = {
    cms_api           = "latest"
    discovery_api     = "latest"
    outbox_publisher  = "latest"
    sync_worker       = "latest"
  }
} 