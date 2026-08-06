variable "project_name" {
  description = "Project name used as prefix for AWS resources."
  type        = string
  default     = "pre-ordering-system"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region where resources will be created."
  type        = string
  default     = "us-west-2"
}

variable "aws_profile" {
  description = "AWS CLI profile used during local Terraform execution."
  type        = string
  default     = "huzaifa-terraform"
}