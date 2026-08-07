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
