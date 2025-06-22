output "cms_api_ecr_repository_url" {
  description = "ECR repository URL for CMS API"
  value       = module.ecr.cms_api_repository_url
}

output "discovery_api_ecr_repository_url" {
  description = "ECR repository URL for Discovery API"
  value       = module.ecr.discovery_api_repository_url
}

output "outbox_publisher_ecr_repository_url" {
  description = "ECR repository URL for Outbox Publisher"
  value       = module.ecr.outbox_publisher_repository_url
}

output "sync_worker_ecr_repository_url" {
  description = "ECR repository URL for Sync Worker"
  value       = module.ecr.sync_worker_repository_url
} 