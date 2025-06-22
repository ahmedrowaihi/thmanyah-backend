output "redis_endpoint" {
  description = "The connection endpoint for the Redis cluster"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_host" {
  description = "The hostname of the Redis cluster"
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
}

output "redis_port" {
  description = "The port for the Redis cluster"
  value       = aws_elasticache_cluster.redis.port
}

output "redis_security_group_id" {
  description = "The security group ID for the Redis cluster"
  value       = aws_security_group.redis.id
}

output "redis_subnet_group_name" {
  description = "The subnet group name for the Redis cluster"
  value       = aws_elasticache_subnet_group.redis.name
} 