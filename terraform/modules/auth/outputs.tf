# Cognito User Pool ID
output "user_pool_id" {
  description = "ID of the Cognito User Pool."
  value       = aws_cognito_user_pool.main.id
}

# Cognito User Pool ARN
output "user_pool_arn" {
  description = "ARN of the Cognito User Pool."
  value       = aws_cognito_user_pool.main.arn
}

# Cognito App Client ID
output "user_pool_client_id" {
  description = "ID of the Cognito User Pool App Client."
  value       = aws_cognito_user_pool_client.frontend.id
}
