output "terraform_state_bucket_name" {
  description = "Name of the Terraform state S3 bucket."
  value       = aws_s3_bucket.terraform_state.bucket
}

output "terraform_state_bucket_arn" {
  description = "ARN of the Terraform state S3 bucket."
  value       = aws_s3_bucket.terraform_state.arn
}

output "pipeline_artifact_bucket_name" {
  description = "Name of the CodePipeline artifact S3 bucket."
  value       = aws_s3_bucket.pipeline_artifacts.bucket
}

output "pipeline_artifact_bucket_arn" {
  description = "ARN of the CodePipeline artifact S3 bucket."
  value       = aws_s3_bucket.pipeline_artifacts.arn
}
