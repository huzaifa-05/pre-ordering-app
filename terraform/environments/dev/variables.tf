variable "project_name" {
  description = "Project name."
  type        = string
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
}

variable "aws_region" {
  description = "AWS region for project resources."
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

variable "vpc_cidr" {
  description = "CIDR block for the dev VPC."
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets."
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets."
  type        = list(string)
}

variable "availability_zones" {
  description = "Availability Zones used in dev."
  type        = list(string)
}
