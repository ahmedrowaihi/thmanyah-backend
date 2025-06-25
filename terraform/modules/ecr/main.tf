# ECR Repository for CMS API
resource "aws_ecr_repository" "cms_api" {
  name                 = "${var.app_name}-${var.environment}-cms-api"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-cms-api-repo"
    Environment = var.environment
  }
}

# ECR Repository for Discovery API
resource "aws_ecr_repository" "discovery_api" {
  name                 = "${var.app_name}-${var.environment}-discovery-api"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-discovery-api-repo"
    Environment = var.environment
  }
}

# ECR Repository for Outbox Publisher
resource "aws_ecr_repository" "outbox_publisher" {
  name                 = "${var.app_name}-${var.environment}-outbox-publisher"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-outbox-publisher-repo"
    Environment = var.environment
  }
}

# ECR Repository for Sync Worker
resource "aws_ecr_repository" "sync_worker" {
  name                 = "${var.app_name}-${var.environment}-sync-worker"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-sync-worker-repo"
    Environment = var.environment
  }
} 