# Thmanyah Backend Infrastructure

This Terraform configuration deploys the complete infrastructure for the Thmanyah backend services on AWS.

## Architecture

The infrastructure includes:

- **VPC** with public and private subnets across multiple AZs
- **RDS PostgreSQL** database for data persistence
- **ElastiCache Redis** for caching and session management
- **OpenSearch** (Elasticsearch) for search functionality
- **ECS Fargate** cluster running 4 microservices:
  - CMS API (port 3001)
  - Discovery API (port 3002)
  - Outbox Publisher (background service)
  - Sync Worker (background service)
- **Application Load Balancer** for routing traffic
- **CloudWatch** for logging and monitoring
- **IAM** roles and security groups

## Security

- All services run in private subnets
- Database and cache are not publicly accessible
- Security groups restrict access between services
- Passwords and secrets are passed as environment variables (not stored in AWS Secrets Manager)

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Terraform** (version >= 1.0)
3. **Docker images** built and pushed to ECR

## Configuration

### 1. Update terraform.tfvars

Edit the `terraform.tfvars` file in your target environment directory:

```bash
cd terraform/environments/dev  # or prod
```

Update the following variables:

```hcl
# Replace these with secure passwords
db_password = "your_secure_db_password_here"
redis_password = "your_secure_redis_password_here"
elasticsearch_password = "your_secure_elasticsearch_password_here"
jwt_secret = "your_secure_jwt_secret_here"

# Update Docker image URIs after building and pushing
cms_api_image = "your-account.dkr.ecr.region.amazonaws.com/thmanyah-cms-api:latest"
discovery_api_image = "your-account.dkr.ecr.region.amazonaws.com/thmanyah-discovery-api:latest"
outbox_publisher_image = "your-account.dkr.ecr.region.amazonaws.com/thmanyah-outbox-publisher:latest"
sync_worker_image = "your-account.dkr.ecr.region.amazonaws.com/thmanyah-sync-worker:latest"
```

### 2. Build and Push Docker Images

```bash
# Build images
docker build -t thmanyah-cms-api ./apps/cms-api
docker build -t thmanyah-discovery-api ./apps/discovery-api
docker build -t thmanyah-outbox-publisher ./apps/outbox-publisher
docker build -t thmanyah-sync-worker ./apps/sync-worker

# Tag and push to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account.dkr.ecr.region.amazonaws.com

docker tag thmanyah-cms-api:latest your-account.dkr.ecr.region.amazonaws.com/thmanyah-cms-api:latest
docker tag thmanyah-discovery-api:latest your-account.dkr.ecr.region.amazonaws.com/thmanyah-discovery-api:latest
docker tag thmanyah-outbox-publisher:latest your-account.dkr.ecr.region.amazonaws.com/thmanyah-outbox-publisher:latest
docker tag thmanyah-sync-worker:latest your-account.dkr.ecr.region.amazonaws.com/thmanyah-sync-worker:latest

docker push your-account.dkr.ecr.region.amazonaws.com/thmanyah-cms-api:latest
docker push your-account.dkr.ecr.region.amazonaws.com/thmanyah-discovery-api:latest
docker push your-account.dkr.ecr.region.amazonaws.com/thmanyah-outbox-publisher:latest
docker push your-account.dkr.ecr.region.amazonaws.com/thmanyah-sync-worker:latest
```

## Deployment

### Development Environment

```bash
cd terraform/environments/dev
terraform init
terraform plan
terraform apply
```

### Production Environment

```bash
cd terraform/environments/prod
terraform init
terraform plan
terraform apply
```

## Monitoring

- **CloudWatch Logs**: Each service has its own log group
- **ECS Console**: Monitor service health and task status
- **RDS Console**: Database performance and connections
- **ElastiCache Console**: Redis performance metrics

## Environment Variables

The following environment variables are automatically configured for each service:

### CMS API

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `ELASTICSEARCH_HOST`, `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`
- `JWT_SECRET`

### Discovery API

- `ELASTICSEARCH_HOST`, `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`

### Outbox Publisher

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

### Sync Worker

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `ELASTICSEARCH_HOST`, `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`

## Cleanup

To destroy the infrastructure:

```bash
terraform destroy
```

**Warning**: This will permanently delete all resources including the database and its data.
