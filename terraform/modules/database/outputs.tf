# Aurora cluster ID
output "cluster_id" {
  description = "ID of the Aurora MySQL cluster."
  value       = aws_rds_cluster.main.id
}

# Aurora cluster ARN
output "cluster_arn" {
  description = "ARN of the Aurora MySQL cluster."
  value       = aws_rds_cluster.main.arn
}

# Writer endpoint
output "cluster_endpoint" {
  description = "Writer endpoint of the Aurora MySQL cluster."
  value       = aws_rds_cluster.main.endpoint
}

# Reader endpoint
output "reader_endpoint" {
  description = "Reader endpoint of the Aurora MySQL cluster."
  value       = aws_rds_cluster.main.reader_endpoint
}

# Application database name
output "database_name" {
  description = "Name of the application database."
  value       = aws_rds_cluster.main.database_name
}

# Database port
output "port" {
  description = "Port used by the Aurora MySQL cluster."
  value       = aws_rds_cluster.main.port
}

# Managed master secret ARN
output "master_user_secret_arn" {
  description = "ARN of the managed master user secret."
  value       = try(aws_rds_cluster.main.master_user_secret[0].secret_arn, null)
}
