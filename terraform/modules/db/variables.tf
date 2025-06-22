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
  description = "List of private subnet IDs for the DB subnet group"
  type        = list(string)
}

variable "db_name" {
  description = "Name of the database"
  type        = string
}

variable "db_user" {
  description = "Username for the database"
  type        = string
}

variable "db_password" {
  description = "Password for the database"
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
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Allocated storage for the RDS instance in GB"
  type        = number
  default     = 10
} 