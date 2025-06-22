output "ecs_cluster_id" {
  description = "The ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_arn" {
  description = "The ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
}

output "ecs_task_execution_role_arn" {
  description = "The ARN of the ECS task execution role"
  value       = aws_iam_role.ecs_task_execution_role.arn
}

output "ecs_task_role_arn" {
  description = "The ARN of the ECS task role"
  value       = aws_iam_role.ecs_task_role.arn
}

output "ecs_security_group_id" {
  description = "The security group ID for ECS tasks"
  value       = aws_security_group.ecs_tasks.id
}

output "alb_dns_name" {
  description = "The DNS name of the load balancer"
  value       = aws_lb.main.dns_name
}

output "alb_arn" {
  description = "The ARN of the load balancer"
  value       = aws_lb.main.arn
}

output "alb_security_group_id" {
  description = "The security group ID for the ALB"
  value       = aws_security_group.alb.id
}

output "cms_api_target_group_arn" {
  description = "The ARN of the CMS API target group"
  value       = aws_lb_target_group.cms_api.arn
}

output "discovery_api_target_group_arn" {
  description = "The ARN of the Discovery API target group"
  value       = aws_lb_target_group.discovery_api.arn
}

output "cms_api_service_name" {
  description = "The name of the CMS API service"
  value       = aws_ecs_service.cms_api.name
}

output "discovery_api_service_name" {
  description = "The name of the Discovery API service"
  value       = aws_ecs_service.discovery_api.name
}

output "outbox_publisher_service_name" {
  description = "The name of the Outbox Publisher service"
  value       = aws_ecs_service.outbox_publisher.name
}

output "sync_worker_service_name" {
  description = "The name of the Sync Worker service"
  value       = aws_ecs_service.sync_worker.name
}

output "log_group_names" {
  description = "The names of the CloudWatch log groups"
  value = {
    cms_api         = aws_cloudwatch_log_group.cms_api.name
    discovery_api   = aws_cloudwatch_log_group.discovery_api.name
    outbox_publisher = aws_cloudwatch_log_group.outbox_publisher.name
    sync_worker     = aws_cloudwatch_log_group.sync_worker.name
  }
}

output "cluster_id" {
  description = "The ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "cluster_arn" {
  description = "The ARN of the ECS cluster"
  value       = aws_ecs_cluster.main.arn
} 