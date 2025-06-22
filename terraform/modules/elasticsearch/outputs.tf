output "elasticsearch_endpoint" {
  description = "The connection endpoint for the OpenSearch domain"
  value       = aws_opensearch_domain.main.endpoint
}

output "elasticsearch_host" {
  description = "The hostname of the OpenSearch domain"
  value       = aws_opensearch_domain.main.endpoint
}

output "elasticsearch_username" {
  description = "The username for OpenSearch"
  value       = var.elasticsearch_username
}

output "elasticsearch_domain_arn" {
  description = "The ARN of the OpenSearch domain"
  value       = aws_opensearch_domain.main.arn
}

output "elasticsearch_domain_id" {
  description = "The ID of the OpenSearch domain"
  value       = aws_opensearch_domain.main.domain_id
}

output "elasticsearch_security_group_id" {
  description = "ID of the OpenSearch security group"
  value       = aws_security_group.elasticsearch.id
} 