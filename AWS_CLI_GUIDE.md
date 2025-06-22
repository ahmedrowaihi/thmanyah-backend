# AWS CLI Guide for Thmanyah Backend

This guide covers essential AWS CLI commands for managing the Thmanyah Backend infrastructure deployed via Terraform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [ECS (Elastic Container Service)](#ecs-elastic-container-service)
- [Image Verification](#image-verification)
- [RDS (Database)](#rds-database)
- [OpenSearch (Search)](#opensearch-search)
- [Load Balancer](#load-balancer)
- [Monitoring & Logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Useful Aliases](#useful-aliases)

## Prerequisites

### AWS CLI Setup

```bash
# Install AWS CLI (if not already installed)
brew install awscli

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID, Secret Access Key, Region (us-east-1), and output format (json)
```

### Project Variables

```bash
# Set these variables for easier command usage
export CLUSTER_NAME="thmanyah-backend-dev-cluster"
export REGION="us-east-1"
export PROJECT_NAME="thmanyah-backend-dev"
```

## ECS (Elastic Container Service)

### List and Inspect Clusters

```bash
# List all ECS clusters
aws ecs list-clusters

# Describe specific cluster
aws ecs describe-clusters --clusters $CLUSTER_NAME

# List services in cluster
aws ecs list-services --cluster $CLUSTER_NAME

# List services with table format
aws ecs list-services --cluster $CLUSTER_NAME --output table
```

### Service Management

```bash
# List all services in the cluster
aws ecs list-services --cluster $CLUSTER_NAME

# Describe a specific service
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $PROJECT_NAME-cms-api

# Check service status
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $PROJECT_NAME-cms-api \
  --query "services[0].{ServiceName:serviceName,Status:status,RunningCount:runningCount,DesiredCount:desiredCount}" \
  --output table
```

### Task Management

```bash
# List running tasks
aws ecs list-tasks --cluster $CLUSTER_NAME

# List tasks for specific service
aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $PROJECT_NAME-cms-api

# Describe a specific task
aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks <task-arn>

# Get task details with key information
aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks <task-arn> \
  --query "tasks[0].{TaskArn:taskArn,LastStatus:lastStatus,HealthStatus:healthStatus,CreatedAt:createdAt}" \
  --output table
```

### Deployment Management

```bash
# Force new deployment
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $PROJECT_NAME-cms-api \
  --force-new-deployment

# Update service desired count
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $PROJECT_NAME-cms-api \
  --desired-count 2

# Scale down service
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $PROJECT_NAME-cms-api \
  --desired-count 0
```

## Image Verification

### Check if Latest Images are Running

```bash
# Method 1: Check ECS Service Status and Image Tags
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $PROJECT_NAME-cms-api $PROJECT_NAME-discovery-api $PROJECT_NAME-outbox-publisher $PROJECT_NAME-sync-worker \
  --query 'services[*].{ServiceName:serviceName,Image:taskDefinition,DesiredCount:desiredCount,RunningCount:runningCount,PendingCount:pendingCount}' \
  --output table

# Method 2: Check Current Image Tags in Task Definitions
for service in cms-api discovery-api outbox-publisher sync-worker; do
  echo "=== $service ===";
  aws ecs describe-task-definition \
    --task-definition $PROJECT_NAME-$service \
    --query 'taskDefinition.containerDefinitions[0].image' \
    --output text;
done

# Method 3: Check Running Task Image Digest
# Get task ARN for a specific service
TASK_ARN=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $PROJECT_NAME-cms-api \
  --query 'taskArns[0]' \
  --output text)

# Check the image being used by the running task
aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks $TASK_ARN \
  --query 'tasks[0].containers[0].{Image:image,ImageDigest:imageDigest}' \
  --output table

# Method 4: Compare with ECR Latest Image
# Get latest ECR image digest
aws ecr list-images \
  --repository-name $PROJECT_NAME-cms-api \
  --query 'imageIds[0].imageDigest' \
  --output text

# Method 5: Comprehensive Image Verification Script
#!/bin/bash
echo "=== Image Verification Report ==="
echo

for service in cms-api discovery-api outbox-publisher sync-worker; do
  echo "--- $service ---"

  # Get task ARN
  TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --service-name $PROJECT_NAME-$service \
    --query 'taskArns[0]' \
    --output text 2>/dev/null)

  if [ "$TASK_ARN" != "None" ] && [ -n "$TASK_ARN" ]; then
    # Get running task image digest
    RUNNING_DIGEST=$(aws ecs describe-tasks \
      --cluster $CLUSTER_NAME \
      --tasks $TASK_ARN \
      --query 'tasks[0].containers[0].imageDigest' \
      --output text 2>/dev/null)

    # Get latest ECR image digest
    ECR_DIGEST=$(aws ecr list-images \
      --repository-name $PROJECT_NAME-$service \
      --query 'imageIds[0].imageDigest' \
      --output text 2>/dev/null)

    echo "Running Task Digest: $RUNNING_DIGEST"
    echo "Latest ECR Digest:   $ECR_DIGEST"

    if [ "$RUNNING_DIGEST" = "$ECR_DIGEST" ]; then
      echo "✅ Images match - Latest image is running!"
    else
      echo "❌ Images don't match - Service needs update"
    fi
  else
    echo "No running tasks found"
  fi
  echo
done
```

### ECR Repository Management

```bash
# List all ECR repositories
aws ecr describe-repositories \
  --query 'repositories[*].{Name:repositoryName,URI:repositoryUri}' \
  --output table

# List images in a repository
aws ecr list-images \
  --repository-name $PROJECT_NAME-cms-api

# Get image details
aws ecr describe-images \
  --repository-name $PROJECT_NAME-cms-api \
  --query 'imageDetails[0].{ImageTag:imageTags[0],PushedAt:pushedAt,Size:imageSizeInBytes}' \
  --output table

# Delete old images (keep only latest)
aws ecr batch-delete-image \
  --repository-name $PROJECT_NAME-cms-api \
  --image-ids imageTag=old-tag
```

## RDS (Database)

### Database Information

```bash
# List all RDS instances
aws rds describe-db-instances

# List database identifiers only
aws rds describe-db-instances \
  --query "DBInstances[*].DBInstanceIdentifier" \
  --output table

# Get database endpoint
aws rds describe-db-instances \
  --query "DBInstances[0].Endpoint.Address" \
  --output text

# Get database status
aws rds describe-db-instances \
  --query "DBInstances[0].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Engine:Engine,Version:EngineVersion}" \
  --output table

# Get database connection details
aws rds describe-db-instances \
  --query "DBInstances[0].{ID:DBInstanceIdentifier,Endpoint:Endpoint.Address,Port:Endpoint.Port,Status:DBInstanceStatus}" \
  --output table
```

### Database Operations

```bash
# Reboot database (if needed)
aws rds reboot-db-instance \
  --db-instance-identifier $PROJECT_NAME-db

# Get database logs
aws rds describe-db-log-files \
  --db-instance-identifier $PROJECT_NAME-db

# Download specific log file
aws rds download-db-log-file-portion \
  --db-instance-identifier $PROJECT_NAME-db \
  --log-file-name <log-file-name>
```

## OpenSearch (Search)

### Domain Information

```bash
# List all OpenSearch domains
aws opensearch list-domain-names

# Describe specific domain
aws opensearch describe-domain \
  --domain-name $PROJECT_NAME-es

# Get domain status
aws opensearch describe-domain \
  --domain-name $PROJECT_NAME-es \
  --query "DomainStatus.{DomainName:DomainName,Processing:Processing,UpgradeProcessing:UpgradeProcessing}" \
  --output table

# Get domain endpoint
aws opensearch describe-domain \
  --domain-name $PROJECT_NAME-es \
  --query "DomainStatus.Endpoints.vpc" \
  --output text
```

### Domain Operations

```bash
# Check domain health
aws opensearch describe-domain-health \
  --domain-name $PROJECT_NAME-es

# Get domain configuration
aws opensearch describe-domain-config \
  --domain-name $PROJECT_NAME-es
```

## Load Balancer

### ALB Information

```bash
# List load balancers
aws elbv2 describe-load-balancers

# Get ALB details
aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?contains(LoadBalancerName, '$PROJECT_NAME')].{Name:LoadBalancerName,DNSName:DNSName,State:State.Code}" \
  --output table

# List target groups
aws elbv2 describe-target-groups

# Get target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>
```

## Monitoring & Logs

### CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups \
  --query "logGroups[?contains(logGroupName, '$PROJECT_NAME')].logGroupName" \
  --output table

# List log streams for a service
aws logs describe-log-streams \
  --log-group-name "/ecs/$PROJECT_NAME-cms-api" \
  --order-by LastEventTime \
  --descending

# Get recent log events
aws logs get-log-events \
  --log-group-name "/ecs/$PROJECT_NAME-cms-api" \
  --log-stream-name <stream-name> \
  --start-time $(date -d '1 hour ago' +%s)000

# Get logs for the last hour
aws logs filter-log-events \
  --log-group-name "/ecs/$PROJECT_NAME-cms-api" \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --query "events[*].{Timestamp:timestamp,Message:message}" \
  --output table
```

### Metrics

```bash
# Get ECS service metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=$PROJECT_NAME-cms-api Name=ClusterName,Value=$CLUSTER_NAME \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Service Not Starting

```bash
# Check service events
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $PROJECT_NAME-cms-api \
  --query "services[0].events[0:5]" \
  --output table

# Check task definition
aws ecs describe-task-definition \
  --task-definition $PROJECT_NAME-cms-api
```

#### 2. Latest Images Not Running

```bash
# Check if service is using latest image
TASK_ARN=$(aws ecs list-tasks \
  --cluster $CLUSTER_NAME \
  --service-name $PROJECT_NAME-cms-api \
  --query 'taskArns[0]' \
  --output text)

aws ecs describe-tasks \
  --cluster $CLUSTER_NAME \
  --tasks $TASK_ARN \
  --query 'tasks[0].containers[0].imageDigest' \
  --output text

# Compare with ECR latest
aws ecr list-images \
  --repository-name $PROJECT_NAME-cms-api \
  --query 'imageIds[0].imageDigest' \
  --output text

# Force new deployment if needed
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $PROJECT_NAME-cms-api \
  --force-new-deployment
```

#### 3. Database Connection Issues

```bash
# Check database status
aws rds describe-db-instances \
  --db-instance-identifier $PROJECT_NAME-db \
  --query "DBInstances[0].{Status:DBInstanceStatus,Endpoint:Endpoint.Address,Port:Endpoint.Port}" \
  --output table

# Check security groups
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*$PROJECT_NAME*"
```

#### 4. OpenSearch Access Issues

```bash
# Check domain status
aws opensearch describe-domain \
  --domain-name $PROJECT_NAME-es \
  --query "DomainStatus.{Status:Processing,Endpoints:Endpoints}" \
  --output table

# Check security group access
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*elasticsearch*"
```

### Health Check Commands

```bash
# Quick health check script
#!/bin/bash
echo "=== ECS Services ==="
aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $PROJECT_NAME-cms-api $PROJECT_NAME-discovery-api \
  --query "services[*].{Service:serviceName,Status:status,Running:runningCount,Desired:desiredCount}" \
  --output table

echo -e "\n=== Database ==="
aws rds describe-db-instances \
  --query "DBInstances[0].{ID:DBInstanceIdentifier,Status:DBInstanceStatus}" \
  --output table

echo -e "\n=== OpenSearch ==="
aws opensearch describe-domain \
  --domain-name $PROJECT_NAME-es \
  --query "DomainStatus.{Name:DomainName,Status:Processing}" \
  --output table
```

## Useful Aliases

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# Project-specific aliases
alias thmanyah-cluster="aws ecs describe-clusters --clusters thmanyah-backend-dev-cluster"
alias thmanyah-services="aws ecs list-services --cluster thmanyah-backend-dev-cluster --output table"
alias thmanyah-tasks="aws ecs list-tasks --cluster thmanyah-backend-dev-cluster"
alias thmanyah-db="aws rds describe-db-instances --query 'DBInstances[0].{ID:DBInstanceIdentifier,Status:DBInstanceStatus,Endpoint:Endpoint.Address}' --output table"
alias thmanyah-search="aws opensearch describe-domain --domain-name thmanyah-backend-dev-es --query 'DomainStatus.{Name:DomainName,Status:Processing}' --output table"

# Health check
alias thmanyah-health="echo '=== ECS ===' && aws ecs describe-services --cluster thmanyah-backend-dev-cluster --services thmanyah-backend-dev-cms-api thmanyah-backend-dev-discovery-api --query 'services[*].{Service:serviceName,Status:status,Running:runningCount}' --output table && echo -e '\n=== DB ===' && aws rds describe-db-instances --query 'DBInstances[0].{ID:DBInstanceIdentifier,Status:DBInstanceStatus}' --output table"

# Image verification
alias thmanyah-images="for service in cms-api discovery-api outbox-publisher sync-worker; do echo '---' \$service '---'; TASK_ARN=\$(aws ecs list-tasks --cluster thmanyah-backend-dev-cluster --service-name thmanyah-backend-dev-\$service --query 'taskArns[0]' --output text 2>/dev/null); if [ \"\$TASK_ARN\" != \"None\" ] && [ -n \"\$TASK_ARN\" ]; then RUNNING_DIGEST=\$(aws ecs describe-tasks --cluster thmanyah-backend-dev-cluster --tasks \$TASK_ARN --query 'tasks[0].containers[0].imageDigest' --output text 2>/dev/null); ECR_DIGEST=\$(aws ecr list-images --repository-name thmanyah-backend-dev-\$service --query 'imageIds[0].imageDigest' --output text 2>/dev/null); echo \"Running: \$RUNNING_DIGEST\"; echo \"Latest:  \$ECR_DIGEST\"; if [ \"\$RUNNING_DIGEST\" = \"\$ECR_DIGEST\" ]; then echo '✅ Match'; else echo '❌ Mismatch'; fi; else echo 'No running tasks'; fi; echo; done"
```

## Quick Reference

### Essential Commands

```bash
# Check all services status
thmanyah-services

# Check database status
thmanyah-db

# Check search status
thmanyah-search

# Check if latest images are running
thmanyah-images

# Force restart a service
aws ecs update-service --cluster thmanyah-backend-dev-cluster --service thmanyah-backend-dev-cms-api --force-new-deployment

# Get service logs
aws logs filter-log-events --log-group-name "/ecs/thmanyah-backend-dev-cms-api" --start-time $(date -d '1 hour ago' +%s)000
```

### Environment Variables

```bash
export CLUSTER_NAME="thmanyah-backend-dev-cluster"
export PROJECT_NAME="thmanyah-backend-dev"
export REGION="us-east-1"
```

This guide covers the most common AWS CLI operations you'll need for managing your Thmanyah Backend infrastructure. For more advanced operations, refer to the [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/index.html).
