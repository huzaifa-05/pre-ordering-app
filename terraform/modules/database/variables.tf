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

# Private subnet IDs
variable "private_subnet_ids" {
  description = "Private subnet IDs used by the Aurora subnet group."
  type        = list(string)
}

# RDS security group ID
variable "rds_security_group_id" {
  description = "Security group ID attached to the Aurora cluster."
  type        = string
}

# Application database name
variable "database_name" {
  description = "Name of the initial application database."
  type        = string
  default     = "preorderingdb"
}

# Master username
variable "db_master_username" {
  description = "Master username for the Aurora cluster."
  type        = string
  default     = "dbadmin"
}

# Aurora instance class
variable "db_instance_class" {
  description = "Aurora MySQL DB instance class."
  type        = string
}

# Aurora MySQL engine version
variable "engine_version" {
  description = "Aurora MySQL engine version. Null uses the AWS default."
  type        = string
  default     = null
}

# Backup retention period
variable "backup_retention_period" {
  description = "Number of days to retain automated backups."
  type        = number
  default     = 3
}

# Deletion protection
variable "deletion_protection" {
  description = "Whether deletion protection is enabled."
  type        = bool
  default     = false
}

# Final snapshot behavior
variable "skip_final_snapshot" {
  description = "Whether to skip the final snapshot on deletion."
  type        = bool
  default     = true
}
