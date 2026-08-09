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
