output "pipeline_name" {
  description = "Terraform CodePipeline name."
  value       = aws_codepipeline.main.name
}

output "pipeline_arn" {
  description = "Terraform CodePipeline ARN."
  value       = aws_codepipeline.main.arn
}

output "terraform_plan_project_name" {
  description = "Terraform validate and plan CodeBuild project name."
  value       = aws_codebuild_project.terraform_plan.name
}

output "terraform_apply_project_name" {
  description = "Terraform apply CodeBuild project name."
  value       = aws_codebuild_project.terraform_apply.name
}

output "terraform_codebuild_role_arn" {
  description = "Terraform CodeBuild IAM role ARN."
  value       = aws_iam_role.terraform_codebuild.arn
}

output "codepipeline_role_arn" {
  description = "CodePipeline IAM role ARN."
  value       = aws_iam_role.codepipeline.arn
}
