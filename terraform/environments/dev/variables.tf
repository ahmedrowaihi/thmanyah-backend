variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "thmanyah-backend"
}

# Network configuration
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Cost optimization variables
variable "enable_elasticsearch" {
  description = "Enable Elasticsearch/OpenSearch (can be disabled for dev to save costs)"
  type        = bool
  default     = false  # Temporarily disabled
}

variable "enable_external_elasticsearch" {
  description = "Enable external Elasticsearch service (e.g., es.sudorw.com)"
  type        = bool
  default     = false
}

variable "external_elasticsearch_url" {
  description = "External Elasticsearch URL"
  type        = string
  default     = "https://es.sudorw.com"
}

variable "enable_redis" {
  description = "Enable Redis (can be disabled for dev to save costs)"
  type        = bool
  default     = true
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"  # Smallest available
}

variable "elasticsearch_instance_type" {
  description = "OpenSearch instance type"
  type        = string
  default     = "t3.small.search"  # Smallest available
}

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"  # Smallest available
}

variable "ecs_cpu" {
  description = "ECS CPU units per task"
  type        = string
  default     = "256"  # 0.25 vCPU
}

variable "ecs_memory" {
  description = "ECS memory per task (MB)"
  type        = string
  default     = "512"  # 0.5 GB RAM
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1  # Single instance
}

# Database configuration
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "thmanyah"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "thmanyah"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "elasticsearch_username" {
  description = "Elasticsearch username"
  type        = string
  default     = "admin"
}

variable "elasticsearch_password" {
  description = "Elasticsearch password"
  type        = string
  sensitive   = true
}

variable "redis_password" {
  description = "Redis password"
  type        = string
  sensitive   = true
}

# ECR repository names
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