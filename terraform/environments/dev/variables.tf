variable "project_name" {
  description = "Project name used as the resource-name prefix."
  type        = string
  default     = "pre-ordering-system"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region used by the development environment."
  type        = string
  default     = "us-west-2"
}
variable "vpc_cidr" {
  description = "CIDR block for the dev VPC."
  type        = string
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for dev public subnets."
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for dev private subnets."
  type        = list(string)
}
