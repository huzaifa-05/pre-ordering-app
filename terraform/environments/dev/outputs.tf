output "pipeline_name" {
  description = "Terraform CodePipeline name."
  value       = module.pipeline.pipeline_name
}

output "pipeline_arn" {
  description = "Terraform CodePipeline ARN."
  value       = module.pipeline.pipeline_arn
}

output "terraform_plan_project_name" {
  description = "Terraform validate and plan CodeBuild project name."
  value       = module.pipeline.terraform_plan_project_name
}

output "terraform_apply_project_name" {
  description = "Terraform apply CodeBuild project name."
  value       = module.pipeline.terraform_apply_project_name
}

output "terraform_codebuild_role_arn" {
  description = "Terraform CodeBuild IAM role ARN."
  value       = module.pipeline.terraform_codebuild_role_arn
}

output "codepipeline_role_arn" {
  description = "CodePipeline IAM role ARN."
  value       = module.pipeline.codepipeline_role_arn
}

output "vpc_id" {
  description = "Dev VPC ID."
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "Dev public subnet IDs."
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Dev private subnet IDs."
  value       = module.networking.private_subnet_ids
}
# Backend ECR repository URL
output "backend_ecr_repository_url" {
  description = "URL of the backend ECR repository."
  value       = module.ecr.repository_url
}
# ALB DNS name
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer."
  value       = module.alb.alb_dns_name
}
# Backend Auto Scaling Group name
output "backend_autoscaling_group_name" {
  description = "Name of the backend Auto Scaling Group."
  value       = module.compute.autoscaling_group_name
}

# Cognito User Pool ID
output "cognito_user_pool_id" {
  description = "ID of the Cognito User Pool."
  value       = module.auth.user_pool_id
}

# Cognito User Pool App Client ID
output "cognito_user_pool_client_id" {
  description = "ID of the Cognito User Pool App Client."
  value       = module.auth.user_pool_client_id
}

# Cognito User Pool ARN
output "cognito_user_pool_arn" {
  description = "ARN of the Cognito User Pool."
  value       = module.auth.user_pool_arn
}

# Frontend S3 bucket name
output "frontend_bucket_name" {
  description = "Name of the frontend S3 bucket."
  value       = module.frontend_hosting.bucket_name
}

# Frontend S3 bucket ARN
output "frontend_bucket_arn" {
  description = "ARN of the frontend S3 bucket."
  value       = module.frontend_hosting.bucket_arn
}

# Frontend CloudFront distribution ID
output "frontend_cloudfront_distribution_id" {
  description = "ID of the frontend CloudFront distribution."
  value       = module.frontend_hosting.cloudfront_distribution_id
}

# Frontend CloudFront domain name
output "frontend_cloudfront_domain_name" {
  description = "Domain name of the frontend CloudFront distribution."
  value       = module.frontend_hosting.cloudfront_domain_name
}

# Aurora writer endpoint
output "aurora_cluster_endpoint" {
  description = "Writer endpoint of the Aurora MySQL cluster."
  value       = module.database.cluster_endpoint
}

# Aurora reader endpoint
output "aurora_reader_endpoint" {
  description = "Reader endpoint of the Aurora MySQL cluster."
  value       = module.database.reader_endpoint
}

# Aurora cluster ID
output "aurora_cluster_id" {
  description = "ID of the Aurora MySQL cluster."
  value       = module.database.cluster_id
}

# Aurora cluster ARN
output "aurora_cluster_arn" {
  description = "ARN of the Aurora MySQL cluster."
  value       = module.database.cluster_arn
}

# Aurora database name
output "aurora_database_name" {
  description = "Name of the Aurora application database."
  value       = module.database.database_name
}

# Aurora managed secret ARN
output "aurora_master_user_secret_arn" {
  description = "ARN of the Aurora managed master user secret."
  value       = module.database.master_user_secret_arn
}
