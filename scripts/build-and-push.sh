#!/bin/bash

# Thmanyah Backend Docker Build and Push Script
# This script builds and pushes Docker images to ECR

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get AWS account ID
get_aws_account_id() {
    aws sts get-caller-identity --query Account --output text
}

# Function to get AWS region
get_aws_region() {
    aws configure get region || echo "us-east-1"
}

# Function to build and push a single image
build_and_push() {
    local service_name=$1
    local ecr_repo=$2
    
    print_status "Building $service_name for linux/amd64 (AWS compatibility)..."
    
    # Use buildx with multiarch-builder to build for the target platform
    # Build from the root Dockerfile using build args for the specific service
    # Only tag with ECR repository name to avoid pushing to Docker Hub
    docker buildx build \
        --builder multiarch-builder \
        --platform linux/amd64 \
        --build-arg TARGET_APP=$service_name \
        -t $ecr_repo:latest \
        --push \
        .
    
    print_success "$service_name built and pushed successfully!"
}

# Main script
main() {
    print_status "Starting Docker Build and Push..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the thmanyah-backend root directory"
        exit 1
    fi
    
    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity > /dev/null 2>&1; then
        print_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi
    
    # Get AWS account ID and region
    AWS_ACCOUNT_ID=$(get_aws_account_id)
    AWS_REGION=$(get_aws_region)
    
    print_success "AWS Account ID: $AWS_ACCOUNT_ID"
    print_success "AWS Region: $AWS_REGION"
    
    # Check if environment is provided
    ENVIRONMENT=${1:-dev}
    if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
        print_error "Environment must be 'dev' or 'prod'. Usage: $0 [dev|prod]"
        exit 1
    fi
    
    print_status "Building for environment: $ENVIRONMENT"
    
    # Authenticate Docker to ECR
    print_status "Authenticating Docker to ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build and push each service
    build_and_push "cms-api" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-cms-api"
    build_and_push "discovery-api" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-discovery-api"
    build_and_push "outbox-publisher" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-outbox-publisher"
    build_and_push "sync-worker" "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-sync-worker"
    
    print_success "All images built and pushed successfully!"
    
    echo
    print_status "Next steps:"
    echo "1. Run: cd terraform/environments/$ENVIRONMENT"
    echo "2. Run: terraform apply"
    echo "3. Monitor your services in the AWS ECS console"
    echo
    print_status "Your ECR repositories:"
    echo "- $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-cms-api"
    echo "- $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-discovery-api"
    echo "- $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-outbox-publisher"
    echo "- $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/thmanyah-backend-$ENVIRONMENT-sync-worker"
}

# Run the main function
main "$@" 