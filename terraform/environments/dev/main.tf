terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Network module
module "network" {
  source = "../../modules/network"

  app_name    = var.app_name
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  availability_zones = var.availability_zones
}

# Database module
module "db" {
  source = "../../modules/db"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  db_name     = var.db_name
  db_user     = var.db_username
  db_password = var.db_password
  db_instance_class = var.db_instance_class
}

# Redis module (conditional)
module "redis" {
  count = var.enable_redis ? 1 : 0
  
  source = "../../modules/redis"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  redis_node_type = var.redis_node_type
  redis_password  = var.redis_password
}

# ECS module (moved before Elasticsearch to fix circular dependency)
module "ecs" {
  source = "../../modules/ecs"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  subnet_ids  = module.network.private_subnet_ids
  public_subnet_ids = module.network.public_subnet_ids

  # Database
  db_endpoint = module.db.db_endpoint
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  db_port     = "5432"

  # Redis (conditional)
  redis_endpoint = var.enable_redis ? module.redis[0].redis_endpoint : "localhost"
  redis_password = var.enable_redis ? var.redis_password : null
  redis_port     = "6379"

  # Elasticsearch (conditional) - now properly referenced
  elasticsearch_endpoint = var.enable_elasticsearch ? module.elasticsearch[0].elasticsearch_endpoint : null
  elasticsearch_username = var.enable_elasticsearch ? var.elasticsearch_username : null
  elasticsearch_password = var.enable_elasticsearch ? var.elasticsearch_password : null

  # External Elasticsearch (conditional)
  enable_external_elasticsearch = var.enable_external_elasticsearch
  external_elasticsearch_url    = var.external_elasticsearch_url

  # ECS configuration
  cpu           = var.ecs_cpu
  memory        = var.ecs_memory
  desired_count = var.ecs_desired_count

  # ECR repositories
  ecr_repository_names = var.ecr_repository_names
  docker_image_tags    = var.docker_image_tags
}

# Elasticsearch module (conditional) - now after ECS module
module "elasticsearch" {
  count = var.enable_elasticsearch ? 1 : 0
  
  source = "../../modules/elasticsearch"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  elasticsearch_instance_type = var.elasticsearch_instance_type
  elasticsearch_username      = var.elasticsearch_username
  elasticsearch_password      = var.elasticsearch_password
  ecs_security_group_id       = module.ecs.ecs_security_group_id
  ecs_task_role_arn           = module.ecs.ecs_task_role_arn
}

# ECR Repositories
module "ecr" {
  source = "../../modules/ecr"

  app_name    = var.app_name
  environment = var.environment
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "db_endpoint" {
  description = "Database endpoint"
  value       = module.db.db_endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = var.enable_redis ? module.redis[0].redis_endpoint : null
}

output "elasticsearch_endpoint" {
  description = "Elasticsearch endpoint"
  value       = var.enable_elasticsearch ? module.elasticsearch[0].elasticsearch_endpoint : null
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.alb_dns_name
}

output "cms_api_url" {
  description = "CMS API URL"
  value       = "http://${module.ecs.alb_dns_name}:3001"
}

output "discovery_api_url" {
  description = "Discovery API URL"
  value       = "http://${module.ecs.alb_dns_name}:3002"
}

# Data source for account ID
data "aws_caller_identity" "current" {} 