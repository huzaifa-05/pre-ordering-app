output "aws_account_id" {
  description = "AWS Account ID used by Terraform."
  value       = data.aws_caller_identity.current.account_id
}

output "terraform_state_bucket_name" {
  description = "Terraform state bucket name."
  value       = aws_s3_bucket.terraform_state.bucket
}

output "pipeline_artifact_bucket_name" {
  description = "CodePipeline artifact bucket name."
  value       = aws_s3_bucket.pipeline_artifacts.bucket
}
###########################################################
output "github_connection_arn" {
  description = "ARN of the GitHub CodeConnection used by CodePipeline."
  value       = aws_codeconnections_connection.github.arn
}

output "github_connection_status" {
  description = "Current status of the GitHub CodeConnection."
  value       = aws_codeconnections_connection.github.connection_status
}

output "terraform_codebuild_role_arn" {
  description = "IAM role used by Terraform CodeBuild projects"
  value       = aws_iam_role.terraform_codebuild.arn
}

output "codepipeline_role_arn" {
  description = "IAM role used by CodePipeline."
  value       = aws_iam_role.codepipeline.arn
}

output "terraform_validate_plan_project_name" {
  description = "Terraform validate and plan CodeBuild project name."
  value       = aws_codebuild_project.terraform_validate_plan.name
}

output "terraform_apply_project_name" {
  description = "Terraform apply CodeBuild project name."
  value       = aws_codebuild_project.terraform_apply.name
}

output "pipeline_name" {
  description = "Unified Terraform and application pipeline name."
  value       = aws_codepipeline.main.name
}

output "pipeline_arn" {
  description = "Unified CodePipeline ARN."
  value       = aws_codepipeline.main.arn
}
