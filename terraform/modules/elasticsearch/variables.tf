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

variable "private_subnet_ids" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "elasticsearch_instance_type" {
  description = "Instance type for OpenSearch nodes"
  type        = string
  default     = "t3.small.search"
}

variable "elasticsearch_instance_count" {
  description = "Number of OpenSearch instances"
  type        = number
  default     = 1
}

variable "elasticsearch_volume_size" {
  description = "Volume size for OpenSearch in GB"
  type        = number
  default     = 10
}

variable "elasticsearch_username" {
  description = "Username for OpenSearch"
  type        = string
  default     = "admin"
}

variable "elasticsearch_password" {
  description = "Password for OpenSearch"
  type        = string
  sensitive   = true
}

variable "ecs_security_group_id" {
  description = "ID of the ECS security group to allow access to OpenSearch"
  type        = string
  default     = null
}

variable "ecs_task_role_arn" {
  description = "ARN of the ECS task role to allow access to OpenSearch"
  type        = string
} 