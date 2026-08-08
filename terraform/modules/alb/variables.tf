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

# VPC ID
variable "vpc_id" {
  description = "ID of the VPC used by the ALB target group."
  type        = string
}

# Public subnet IDs
variable "public_subnet_ids" {
  description = "Public subnet IDs where the ALB will be deployed."
  type        = list(string)
}

# ALB security group ID
variable "alb_security_group_id" {
  description = "Security group ID attached to the ALB."
  type        = string
}

# Backend application port
variable "backend_port" {
  description = "Port used by the backend application."
  type        = number
  default     = 5000
}

# Health check path
variable "health_check_path" {
  description = "Health check endpoint used by the target group."
  type        = string
  default     = "/api/health"
}
