# Frontend bucket name
output "bucket_name" {
  description = "Name of the frontend S3 bucket."
  value       = aws_s3_bucket.frontend.bucket
}

# Frontend bucket ARN
output "bucket_arn" {
  description = "ARN of the frontend S3 bucket."
  value       = aws_s3_bucket.frontend.arn
}

# CloudFront distribution ID
output "cloudfront_distribution_id" {
  description = "ID of the frontend CloudFront distribution."
  value       = aws_cloudfront_distribution.frontend.id
}

# CloudFront domain name
output "cloudfront_domain_name" {
  description = "Domain name of the frontend CloudFront distribution."
  value       = aws_cloudfront_distribution.frontend.domain_name
}
