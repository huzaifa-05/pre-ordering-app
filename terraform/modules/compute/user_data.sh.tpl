#!/bin/bash
set -e

# Install required packages
dnf update -y
dnf install -y docker awscli-2

# Start Docker
systemctl enable docker
systemctl start docker

# Authenticate Docker with ECR
aws ecr get-login-password --region ${aws_region} \
  | docker login \
    --username AWS \
    --password-stdin ${ecr_registry}

# Read desired image tag
IMAGE_TAG=$(aws ssm get-parameter \
  --name ${image_tag_parameter_name} \
  --region ${aws_region} \
  --query "Parameter.Value" \
  --output text)

# Pull backend image
docker pull ${repository_url}:$IMAGE_TAG

# Start backend container
docker run -d \
  --name backend \
  --restart unless-stopped \
  -p ${backend_port}:${backend_port} \
  -e AWS_REGION=${aws_region} \
  -e DB_HOST=${aurora_cluster_endpoint} \
  -e DB_NAME=${database_name} \
  -e DB_SECRET_ARN=${database_secret_arn} \
  -e COGNITO_REGION=${aws_region} \
  -e COGNITO_USER_POOL_ID=${cognito_user_pool_id} \
  -e COGNITO_CLIENT_ID=${cognito_client_id} \
  ${repository_url}:$IMAGE_TAG
