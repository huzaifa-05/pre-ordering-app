# Project name
variable "project_name" {
  description = "Name of the project used for resource naming."
  type        = string
}

# Deployment environment
variable "environment" {
  description = "Deployment environment such as dev or prod."
  type        = string
}

# Private subnet IDs
variable "private_subnet_ids" {
  description = "Private subnet IDs where EC2 instances will run."
  type        = list(string)
}

# EC2 security group ID
variable "ec2_security_group_id" {
  description = "Security group ID attached to backend EC2 instances."
  type        = string
}

# Blue target group ARN
variable "blue_target_group_arn" {
  description = "Target group ARN used by the blue Auto Scaling Group."
  type        = string
}

# Green target group ARN
variable "green_target_group_arn" {
  description = "Target group ARN used by the green Auto Scaling Group."
  type        = string
}

# ECR repository URL
variable "repository_url" {
  description = "Amazon ECR repository URL for the backend image."
  type        = string
}

# Backend application port
variable "backend_port" {
  description = "Port used by the backend application."
  type        = number
  default     = 5000
}

# EC2 instance type
variable "instance_type" {
  description = "EC2 instance type used by the Auto Scaling Group."
  type        = string
  default     = "t2.micro"
}

# Minimum ASG capacity
variable "min_size" {
  description = "Minimum number of EC2 instances."
  type        = number
  default     = 1
}

# Desired ASG capacity
variable "desired_capacity" {
  description = "Desired number of EC2 instances."
  type        = number
  default     = 1
}

# Maximum ASG capacity
variable "max_size" {
  description = "Maximum number of EC2 instances."
  type        = number
  default     = 3
}

# Target CPU utilization
variable "target_cpu_utilization" {
  description = "Average CPU percentage used for Auto Scaling."
  type        = number
  default     = 70
}
# Backend container image tag
variable "image_tag" {
  description = "Docker image tag to deploy from ECR."
  type        = string
  default     = "v1"
}

# Aurora writer endpoint
variable "aurora_cluster_endpoint" {
  description = "Writer endpoint of the Aurora MySQL cluster."
  type        = string
}

# Application database name
variable "database_name" {
  description = "Name of the application database."
  type        = string
}

# Aurora managed secret ARN
variable "database_secret_arn" {
  description = "ARN of the Aurora managed master user secret."
  type        = string
}

# Cognito User Pool ID
variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool."
  type        = string
}

# Cognito App Client ID
variable "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool App Client."
  type        = string
}
