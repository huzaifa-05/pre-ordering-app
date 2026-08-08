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

# Number of untagged images to retain
variable "untagged_image_count" {
  description = "Number of recent untagged images to retain in ECR."
  type        = number
  default     = 10
}
