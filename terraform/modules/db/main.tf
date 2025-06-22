# Security Group for RDS
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-${var.environment}-rds-sg"
  description = "Security group for RDS instance"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = var.db_port
    to_port     = var.db_port
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
    Name        = "${var.app_name}-${var.environment}-rds-sg"
    Environment = var.environment
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${var.app_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.app_name}-${var.environment}-db-subnet-group"
    Environment = var.environment
  }
}

# DB Parameter Group
resource "aws_db_parameter_group" "main" {
  family = "postgres15"
  name   = "${var.app_name}-${var.environment}-db-params"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "all"
  }

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-db-params"
    Environment = var.environment
  }
}

# RDS Instance
resource "aws_db_instance" "main" {
  identifier             = "${var.app_name}-${var.environment}-db"
  engine                 = "postgres"
  engine_version         = "15"
  instance_class         = var.db_instance_class
  allocated_storage      = var.db_allocated_storage
  storage_type           = "gp2"
  db_name                = var.db_name
  username               = var.db_user
  password               = var.db_password
  parameter_group_name   = aws_db_parameter_group.main.name
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
  multi_az              = var.environment == "prod" ? true : false
  backup_retention_period = var.environment == "prod" ? 7 : 1
  backup_window         = "03:00-04:00"
  maintenance_window    = "Mon:04:00-Mon:05:00"
  deletion_protection   = var.environment == "prod" ? true : false

  tags = {
    Name        = "${var.app_name}-${var.environment}-db"
    Environment = var.environment
  }
} 