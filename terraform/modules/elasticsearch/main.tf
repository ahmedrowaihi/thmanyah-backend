# Security Group for OpenSearch
resource "aws_security_group" "elasticsearch" {
  name        = "${var.app_name}-${var.environment}-elasticsearch-sg"
  description = "Security group for OpenSearch domain"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # Allow access from VPC
  }

  # Allow access from ECS tasks
  dynamic "ingress" {
    for_each = var.ecs_security_group_id != null ? [1] : []
    content {
      from_port       = 443
      to_port         = 443
      protocol        = "tcp"
      security_groups = [var.ecs_security_group_id]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-elasticsearch-sg"
    Environment = var.environment
  }
}

# OpenSearch Domain
resource "aws_opensearch_domain" "main" {
  domain_name    = "${var.app_name}-${var.environment}-es"
  engine_version = "OpenSearch_2.5"

  cluster_config {
    instance_type            = var.elasticsearch_instance_type
    instance_count          = var.elasticsearch_instance_count
    zone_awareness_enabled  = var.elasticsearch_instance_count > 1

    dynamic "zone_awareness_config" {
      for_each = var.elasticsearch_instance_count > 1 ? [1] : []
      content {
        availability_zone_count = var.elasticsearch_instance_count
      }
    }
  }

  vpc_options {
    subnet_ids         = [var.private_subnet_ids[0]]  # Use only first subnet when zone awareness is disabled
    security_group_ids = [aws_security_group.elasticsearch.id]
  }

  ebs_options {
    ebs_enabled = true
    volume_size = var.elasticsearch_volume_size
    volume_type = "gp2"
  }

  encrypt_at_rest {
    enabled = true
  }

  node_to_node_encryption {
    enabled = true
  }

  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
  }

  # Enable advanced security options to allow username/password authentication
  advanced_security_options {
    enabled                        = true
    internal_user_database_enabled = true
  }

  auto_tune_options {
    desired_state = "DISABLED"  # Disabled for t3 instance types
  }

  # Access policy to allow ECS tasks to access the domain (restrictive for advanced security)
  access_policies = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          AWS = var.ecs_task_role_arn
        }
        Action = [
          "es:ESHttp*"
        ]
        Resource = [
          "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${var.app_name}-${var.environment}-es/*"
        ]
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-${var.environment}-opensearch"
    Environment = var.environment
  }
}

# Data sources for ARN construction
data "aws_caller_identity" "current" {}
data "aws_region" "current" {} 