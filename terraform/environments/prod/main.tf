terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# Network Module
module "network" {
  source = "../../modules/network"

  app_name          = var.app_name
  environment       = var.environment
  vpc_cidr         = var.vpc_cidr
  availability_zones = var.availability_zones
}

# Redis Module
module "redis" {
  source = "../../modules/redis"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  redis_node_type = var.redis_node_type
  redis_port      = var.redis_port
  redis_password  = var.redis_password
}

# Elasticsearch Module
module "elasticsearch" {
  source = "../../modules/elasticsearch"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  elasticsearch_instance_type = var.elasticsearch_instance_type
  elasticsearch_instance_count = var.elasticsearch_instance_count
  elasticsearch_volume_size = var.elasticsearch_volume_size
  elasticsearch_username = var.elasticsearch_username
  elasticsearch_password = var.elasticsearch_password
}

# Database Module
module "db" {
  source = "../../modules/db"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids

  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password
  db_port     = var.db_port
  db_instance_class = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
}

# ECS Module for all services
module "ecs" {
  source = "../../modules/ecs"

  app_name    = var.app_name
  environment = var.environment
  vpc_id      = module.network.vpc_id
  public_subnet_ids  = module.network.public_subnet_ids
  private_subnet_ids = module.network.private_subnet_ids

  # Container images for each service
  cms_api_image = var.cms_api_image
  discovery_api_image = var.discovery_api_image
  outbox_publisher_image = var.outbox_publisher_image
  sync_worker_image = var.sync_worker_image

  # Service ports
  cms_api_port = var.cms_api_port
  discovery_api_port = var.discovery_api_port

  # Task resources
  task_cpu    = var.task_cpu
  task_memory = var.task_memory
  region      = var.region

  # Database configuration
  db_host     = module.db.db_host
  db_port     = module.db.db_port
  db_name     = module.db.db_name
  db_username = module.db.db_username
  db_password = var.db_password

  # Redis configuration
  redis_host     = module.redis.redis_host
  redis_port     = module.redis.redis_port
  redis_password = var.redis_password

  # Elasticsearch configuration
  elasticsearch_host     = module.elasticsearch.elasticsearch_host
  elasticsearch_username = module.elasticsearch.elasticsearch_username
  elasticsearch_password = var.elasticsearch_password

  # JWT secret
  jwt_secret = var.jwt_secret

  depends_on = [module.db, module.redis, module.elasticsearch]
}

# Outputs
output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = module.ecs.alb_dns_name
}

output "cms_api_url" {
  description = "The URL for the CMS API"
  value       = "http://${module.ecs.alb_dns_name}:${var.cms_api_port}"
}

output "discovery_api_url" {
  description = "The URL for the Discovery API"
  value       = "http://${module.ecs.alb_dns_name}:${var.discovery_api_port}"
}

output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = module.db.db_endpoint
}

output "redis_endpoint" {
  description = "The connection endpoint for the Redis instance"
  value       = module.redis.redis_endpoint
}

output "elasticsearch_endpoint" {
  description = "The connection endpoint for the Elasticsearch cluster"
  value       = module.elasticsearch.elasticsearch_endpoint
}

output "vpc_id" {
  description = "The ID of the VPC"
  value       = module.network.vpc_id
} 