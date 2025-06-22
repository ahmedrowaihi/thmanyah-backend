output "cms_api_repository_url" {
  description = "URL of the CMS API ECR repository"
  value       = aws_ecr_repository.cms_api.repository_url
}

output "discovery_api_repository_url" {
  description = "URL of the Discovery API ECR repository"
  value       = aws_ecr_repository.discovery_api.repository_url
}

output "outbox_publisher_repository_url" {
  description = "URL of the Outbox Publisher ECR repository"
  value       = aws_ecr_repository.outbox_publisher.repository_url
}

output "sync_worker_repository_url" {
  description = "URL of the Sync Worker ECR repository"
  value       = aws_ecr_repository.sync_worker.repository_url
} 