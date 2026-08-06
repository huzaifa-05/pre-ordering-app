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