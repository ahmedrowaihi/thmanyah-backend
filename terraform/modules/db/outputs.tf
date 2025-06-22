output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_host" {
  description = "The hostname of the RDS instance"
  value       = aws_db_instance.main.endpoint
}

output "db_port" {
  description = "The port the database is listening on"
  value       = aws_db_instance.main.port
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.main.db_name
}

output "db_username" {
  description = "The master username for the database"
  value       = aws_db_instance.main.username
}

output "db_user" {
  description = "The master username for the database"
  value       = aws_db_instance.main.username
}

output "db_security_group_id" {
  description = "The security group ID of the RDS instance"
  value       = aws_security_group.rds.id
}

output "db_instance_id" {
  description = "The RDS instance ID"
  value       = aws_db_instance.main.id
} 