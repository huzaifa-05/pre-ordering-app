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

# Backend application port
variable "backend_port" {
  description = "Port used by the backend application."
  type        = number
  default     = 5000
}
# EC2 instance type
variable "instance_type" {
  description = "EC2 instance type used by the backend Auto Scaling Group."
  type        = string
  default     = "t2.micro"
}

# Minimum ASG capacity
variable "min_size" {
  description = "Minimum number of backend EC2 instances."
  type        = number
  default     = 1
}

# Desired ASG capacity
variable "desired_capacity" {
  description = "Desired number of backend EC2 instances."
  type        = number
  default     = 1
}

# Maximum ASG capacity
variable "max_size" {
  description = "Maximum number of backend EC2 instances."
  type        = number
  default     = 3
}

# Target CPU utilization
variable "target_cpu_utilization" {
  description = "Average CPU utilization target for Auto Scaling."
  type        = number
  default     = 70
}

# Backend Docker image tag
variable "image_tag" {
  description = "Docker image tag deployed from ECR."
  type        = string
  default     = "v1"
}

# Application database name
variable "database_name" {
  description = "Name of the initial Aurora database."
  type        = string
  default     = "preorderingdb"
}

# Database master username
variable "db_master_username" {
  description = "Master username for the Aurora cluster."
  type        = string
  default     = "dbadmin"
}

# Aurora instance class
variable "db_instance_class" {
  description = "Aurora MySQL DB instance class for dev."
  type        = string
}

# Aurora MySQL engine version
variable "db_engine_version" {
  description = "Aurora MySQL engine version. Null uses the AWS default."
  type        = string
  default     = null
}

# Database backup retention
variable "db_backup_retention_period" {
  description = "Number of days to retain Aurora backups."
  type        = number
  default     = 3
}

# Database deletion protection
variable "db_deletion_protection" {
  description = "Whether Aurora deletion protection is enabled."
  type        = bool
  default     = false
}

# Final snapshot behavior
variable "db_skip_final_snapshot" {
  description = "Whether to skip the final Aurora snapshot on deletion."
  type        = bool
  default     = true
}
