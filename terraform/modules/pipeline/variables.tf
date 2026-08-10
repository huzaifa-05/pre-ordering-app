variable "project_name" {
  description = "Project name used as the AWS resource-name prefix."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region for Terraform pipeline resources."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository used by the Terraform pipeline."
  type        = string
}

variable "github_branch" {
  description = "GitHub branch used by the Terraform pipeline."
  type        = string
}

variable "github_connection_arn" {
  description = "Existing authorized GitHub CodeConnection ARN."
  type        = string
}

variable "artifact_bucket_name" {
  description = "Name of the existing CodePipeline artifact bucket."
  type        = string
}

variable "artifact_bucket_arn" {
  description = "ARN of the existing CodePipeline artifact bucket."
  type        = string
}

variable "state_bucket_arn" {
  description = "ARN of the existing Terraform state bucket."
  type        = string
}

variable "ecr_repository_url" {
  description = "URL of the backend ECR repository."
  type        = string
}

variable "ecr_repository_arn" {
  description = "ARN of the backend ECR repository."
  type        = string
}

variable "autoscaling_group_name" {
  description = "Name of the backend Auto Scaling Group."
  type        = string
}

variable "backend_image_tag_parameter_name" {
  description = "Name of the SSM parameter storing the backend image tag."
  type        = string
}

variable "backend_image_tag_parameter_arn" {
  description = "ARN of the SSM parameter storing the backend image tag."
  type        = string
}

variable "frontend_bucket_name" {
  description = "Name of the frontend S3 bucket."
  type        = string
}

variable "frontend_bucket_arn" {
  description = "ARN of the frontend S3 bucket."
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "ID of the frontend CloudFront distribution."
  type        = string
}

variable "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool."
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool App Client."
  type        = string
}

variable "backend_api_url" {
  description = "Base API URL used by the frontend build."
  type        = string
}
