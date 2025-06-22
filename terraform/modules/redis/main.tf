# Security Group for Redis
resource "aws_security_group" "redis" {
  name        = "${var.app_name}-${var.environment}-redis-sg"
  description = "Security group for Redis cluster"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = var.redis_port
    to_port     = var.redis_port
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # Allow access from VPC
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-redis-sg"
    Environment = var.environment
  }
}

# Redis Subnet Group
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.app_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.app_name}-${var.environment}-redis-subnet-group"
    Environment = var.environment
  }
}

# Redis Parameter Group
resource "aws_elasticache_parameter_group" "redis" {
  family = "redis7"
  name   = "${var.app_name}-${var.environment}-redis-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "notify-keyspace-events"
    value = "Ex"
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-redis-params"
    Environment = var.environment
  }
}

# Redis Cluster
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "${var.app_name}-${var.environment}-redis"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = aws_elasticache_parameter_group.redis.name
  port                 = var.redis_port
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]

  tags = {
    Name        = "${var.app_name}-${var.environment}-redis"
    Environment = var.environment
  }
} 