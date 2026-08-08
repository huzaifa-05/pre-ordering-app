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

# Pull backend image
docker pull ${repository_url}:${image_tag}

# Start backend container
docker run -d \
  --name backend \
  --restart unless-stopped \
  -p ${backend_port}:${backend_port} \
  ${repository_url}:${image_tag}