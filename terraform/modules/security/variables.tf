variable "project_name" {
  description = "Name of the project used for resource naming."
  type        = string
}

variable "environment" {
  description = "Deployment environment, such as dev, staging, or prod."
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where the security groups will be created."
  type        = string
}

variable "backend_port" {
  description = "Port used by the backend application running on EC2."
  type        = number
  default     = 5000
}

variable "cloudfront_prefix_list_id" {
  description = "AWS-managed prefix list ID for CloudFront origin-facing infrastructure."
  type        = string
}
