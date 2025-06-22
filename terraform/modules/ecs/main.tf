# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.app_name}-${var.environment}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-cluster"
    Environment = var.environment
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "cms_api" {
  name              = "/ecs/${var.app_name}-${var.environment}-cms-api"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "${var.app_name}-${var.environment}-cms-api-log-group"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "discovery_api" {
  name              = "/ecs/${var.app_name}-${var.environment}-discovery-api"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "${var.app_name}-${var.environment}-discovery-api-log-group"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "outbox_publisher" {
  name              = "/ecs/${var.app_name}-${var.environment}-outbox-publisher"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "${var.app_name}-${var.environment}-outbox-publisher-log-group"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "sync_worker" {
  name              = "/ecs/${var.app_name}-${var.environment}-sync-worker"
  retention_in_days = var.environment == "prod" ? 30 : 7

  tags = {
    Name        = "${var.app_name}-${var.environment}-sync-worker-log-group"
    Environment = var.environment
  }
}

# ECS Task Execution Role
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.app_name}-${var.environment}-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-${var.environment}-task-execution-role"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Role
resource "aws_iam_role" "ecs_task_role" {
  name = "${var.app_name}-${var.environment}-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.app_name}-${var.environment}-task-role"
    Environment = var.environment
  }
}

# IAM Policy for OpenSearch access
resource "aws_iam_role_policy" "ecs_task_opensearch_policy" {
  name = "${var.app_name}-${var.environment}-task-opensearch-policy"
  role = aws_iam_role.ecs_task_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "es:ESHttp*"
        ]
        Resource = [
          "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${var.app_name}-${var.environment}-es/*"
        ]
      }
    ]
  })
}

# Security Group for ALB
resource "aws_security_group" "alb" {
  name        = "${var.app_name}-${var.environment}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3002
    to_port     = 3002
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-alb-sg"
    Environment = var.environment
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_tasks" {
  name        = "${var.app_name}-${var.environment}-ecs-tasks-sg"
  description = "Security group for ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 3001
    to_port         = 3001
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port       = 3002
    to_port         = 3002
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-ecs-tasks-sg"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.app_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = var.public_subnet_ids

  enable_deletion_protection = var.environment == "prod" ? true : false

  tags = {
    Name        = "${var.app_name}-${var.environment}-alb"
    Environment = var.environment
  }
}

# Target Group for CMS API
resource "aws_lb_target_group" "cms_api" {
  name        = "${var.app_name}-${var.environment}-cms-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/v1/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-cms-api-tg"
    Environment = var.environment
  }
}

# Target Group for Discovery API
resource "aws_lb_target_group" "discovery_api" {
  name        = "${var.app_name}-${var.environment}-disc-tg"
  port        = 3002
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    interval            = 30
    matcher             = "200"
    path                = "/v1/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-discovery-api-tg"
    Environment = var.environment
  }
}

# ALB Listener for CMS API
resource "aws_lb_listener" "cms_api" {
  load_balancer_arn = aws_lb.main.arn
  port              = 3001
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.cms_api.arn
  }
}

# ALB Listener for Discovery API
resource "aws_lb_listener" "discovery_api" {
  load_balancer_arn = aws_lb.main.arn
  port              = 3002
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.discovery_api.arn
  }
}

# ECS Task Definition for CMS API
resource "aws_ecs_task_definition" "cms_api" {
  family                   = "${var.app_name}-${var.environment}-cms-api"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = var.cpu
  memory                  = var.memory
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-${var.environment}-cms-api"
      image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.app_name}-${var.environment}-cms-api:${var.docker_image_tags.cms_api}"
      essential = true

      portMappings = [
        {
          containerPort = 3001
          protocol      = "tcp"
        }
      ]

      environment = concat([
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_HOST"
          value = split(":", var.db_endpoint)[0]
        },
        {
          name  = "DATABASE_NAME"
          value = var.db_name
        },
        {
          name  = "DATABASE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATABASE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DATABASE_PORT"
          value = var.db_port
        },
        {
          name  = "REDIS_HOST"
          value = var.redis_endpoint
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        },
        {
          name  = "CMS_API_PORT"
          value = "3001"
        },
        {
          name  = "DISCOVERY_API_PORT"
          value = "3002"
        },
        {
          name  = "CORS_ORIGINS"
          value = var.cors_origins
        },
        {
          name  = "CORS_ALLOWED_HEADERS"
          value = var.cors_allowed_headers
        },
        {
          name  = "CMS_API_SERVER_URL"
          value = var.cms_api_server_url
        },
        {
          name  = "DISCOVERY_API_SERVER_URL"
          value = var.discovery_api_server_url
        },
        {
          name  = "CMS_API_SERVER_DESCRIPTION"
          value = var.cms_api_server_description
        },
        {
          name  = "DISCOVERY_API_SERVER_DESCRIPTION"
          value = var.discovery_api_server_description
        }
      ], var.elasticsearch_endpoint != null ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = "https://${var.elasticsearch_endpoint}"
        },
        {
          name  = "ELASTICSEARCH_USERNAME"
          value = var.elasticsearch_username
        },
        {
          name  = "ELASTICSEARCH_PASSWORD"
          value = var.elasticsearch_password
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : var.enable_external_elasticsearch ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = var.external_elasticsearch_url
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : [])

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.cms_api.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-${var.environment}-cms-api-task-def"
    Environment = var.environment
  }
}

# ECS Task Definition for Discovery API
resource "aws_ecs_task_definition" "discovery_api" {
  family                   = "${var.app_name}-${var.environment}-discovery-api"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = var.cpu
  memory                  = var.memory
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-${var.environment}-discovery-api"
      image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.app_name}-${var.environment}-discovery-api:${var.docker_image_tags.discovery_api}"
      essential = true

      portMappings = [
        {
          containerPort = 3002
          protocol      = "tcp"
        }
      ]

      environment = concat([
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_HOST"
          value = split(":", var.db_endpoint)[0]
        },
        {
          name  = "DATABASE_NAME"
          value = var.db_name
        },
        {
          name  = "DATABASE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATABASE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DATABASE_PORT"
          value = var.db_port
        },
        {
          name  = "REDIS_HOST"
          value = var.redis_endpoint
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        },
        {
          name  = "CMS_API_PORT"
          value = "3001"
        },
        {
          name  = "DISCOVERY_API_PORT"
          value = "3002"
        },
        {
          name  = "CORS_ORIGINS"
          value = var.cors_origins
        },
        {
          name  = "CORS_ALLOWED_HEADERS"
          value = var.cors_allowed_headers
        },
        {
          name  = "CMS_API_SERVER_URL"
          value = var.cms_api_server_url
        },
        {
          name  = "DISCOVERY_API_SERVER_URL"
          value = var.discovery_api_server_url
        },
        {
          name  = "CMS_API_SERVER_DESCRIPTION"
          value = var.cms_api_server_description
        },
        {
          name  = "DISCOVERY_API_SERVER_DESCRIPTION"
          value = var.discovery_api_server_description
        }
      ], var.elasticsearch_endpoint != null ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = "https://${var.elasticsearch_endpoint}"
        },
        {
          name  = "ELASTICSEARCH_USERNAME"
          value = var.elasticsearch_username
        },
        {
          name  = "ELASTICSEARCH_PASSWORD"
          value = var.elasticsearch_password
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : var.enable_external_elasticsearch ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = var.external_elasticsearch_url
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : [])

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.discovery_api.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-${var.environment}-discovery-api-task-def"
    Environment = var.environment
  }
}

# ECS Task Definition for Outbox Publisher
resource "aws_ecs_task_definition" "outbox_publisher" {
  family                   = "${var.app_name}-${var.environment}-outbox-publisher"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = var.cpu
  memory                  = var.memory
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-${var.environment}-outbox-publisher"
      image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.app_name}-${var.environment}-outbox-publisher:${var.docker_image_tags.outbox_publisher}"
      essential = true

      environment = concat([
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_HOST"
          value = split(":", var.db_endpoint)[0]
        },
        {
          name  = "DATABASE_NAME"
          value = var.db_name
        },
        {
          name  = "DATABASE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATABASE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DATABASE_PORT"
          value = var.db_port
        },
        {
          name  = "REDIS_HOST"
          value = var.redis_endpoint
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        }
      ], var.elasticsearch_endpoint != null ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = "https://${var.elasticsearch_endpoint}"
        },
        {
          name  = "ELASTICSEARCH_USERNAME"
          value = var.elasticsearch_username
        },
        {
          name  = "ELASTICSEARCH_PASSWORD"
          value = var.elasticsearch_password
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : var.enable_external_elasticsearch ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = var.external_elasticsearch_url
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : [])

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.outbox_publisher.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-${var.environment}-outbox-publisher-task-def"
    Environment = var.environment
  }
}

# ECS Task Definition for Sync Worker
resource "aws_ecs_task_definition" "sync_worker" {
  family                   = "${var.app_name}-${var.environment}-sync-worker"
  network_mode            = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                     = var.cpu
  memory                  = var.memory
  execution_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn           = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.app_name}-${var.environment}-sync-worker"
      image     = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/${var.app_name}-${var.environment}-sync-worker:${var.docker_image_tags.sync_worker}"
      essential = true

      environment = concat([
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_HOST"
          value = split(":", var.db_endpoint)[0]
        },
        {
          name  = "DATABASE_NAME"
          value = var.db_name
        },
        {
          name  = "DATABASE_USERNAME"
          value = var.db_username
        },
        {
          name  = "DATABASE_PASSWORD"
          value = var.db_password
        },
        {
          name  = "DATABASE_PORT"
          value = var.db_port
        },
        {
          name  = "REDIS_HOST"
          value = var.redis_endpoint
        },
        {
          name  = "REDIS_PORT"
          value = var.redis_port
        }
      ], var.elasticsearch_endpoint != null ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = "https://${var.elasticsearch_endpoint}"
        },
        {
          name  = "ELASTICSEARCH_USERNAME"
          value = var.elasticsearch_username
        },
        {
          name  = "ELASTICSEARCH_PASSWORD"
          value = var.elasticsearch_password
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : var.enable_external_elasticsearch ? [
        {
          name  = "ELASTICSEARCH_URL"
          value = var.external_elasticsearch_url
        },
        {
          name  = "ELASTICSEARCH_INDEX_NAME"
          value = "programs"
        }
      ] : [])

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.sync_worker.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Name        = "${var.app_name}-${var.environment}-sync-worker-task-def"
    Environment = var.environment
  }
}

# ECS Service for CMS API
resource "aws_ecs_service" "cms_api" {
  name            = "${var.app_name}-${var.environment}-cms-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.cms_api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = var.subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.cms_api.arn
    container_name   = "${var.app_name}-${var.environment}-cms-api"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.cms_api]

  tags = {
    Name        = "${var.app_name}-${var.environment}-cms-api-service"
    Environment = var.environment
  }
}

# ECS Service for Discovery API
resource "aws_ecs_service" "discovery_api" {
  name            = "${var.app_name}-${var.environment}-discovery-api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.discovery_api.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = var.subnet_ids
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.discovery_api.arn
    container_name   = "${var.app_name}-${var.environment}-discovery-api"
    container_port   = 3002
  }

  depends_on = [aws_lb_listener.discovery_api]

  tags = {
    Name        = "${var.app_name}-${var.environment}-discovery-api-service"
    Environment = var.environment
  }
}

# ECS Service for Outbox Publisher
resource "aws_ecs_service" "outbox_publisher" {
  name            = "${var.app_name}-${var.environment}-outbox-publisher"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.outbox_publisher.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = var.subnet_ids
    assign_public_ip = false
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-outbox-publisher-service"
    Environment = var.environment
  }
}

# ECS Service for Sync Worker
resource "aws_ecs_service" "sync_worker" {
  name            = "${var.app_name}-${var.environment}-sync-worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.sync_worker.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs_tasks.id]
    subnets          = var.subnet_ids
    assign_public_ip = false
  }

  tags = {
    Name        = "${var.app_name}-${var.environment}-sync-worker-service"
    Environment = var.environment
  }
}

# Data sources for current AWS account and region
data "aws_caller_identity" "current" {}
data "aws_region" "current" {} 