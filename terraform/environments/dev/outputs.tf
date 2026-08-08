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
