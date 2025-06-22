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

variable "redis_node_type" {
  description = "Node type for Redis cluster"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_port" {
  description = "Port for Redis"
  type        = number
  default     = 6379
}

variable "redis_password" {
  description = "Password for Redis"
  type        = string
  sensitive   = true
} 