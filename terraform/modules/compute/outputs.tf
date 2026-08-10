# Auto Scaling Group name
output "autoscaling_group_name" {
  description = "Name of the backend Auto Scaling Group."
  value       = aws_autoscaling_group.backend.name
}

# Launch Template ID
output "launch_template_id" {
  description = "ID of the backend EC2 Launch Template."
  value       = aws_launch_template.backend.id
}

# EC2 IAM role ARN
output "ec2_role_arn" {
  description = "ARN of the IAM role attached to backend EC2 instances."
  value       = aws_iam_role.ec2.arn
}

# Backend image tag parameter name
output "backend_image_tag_parameter_name" {
  description = "Name of the SSM parameter storing the backend image tag."
  value       = aws_ssm_parameter.backend_image_tag.name
}

# Backend image tag parameter ARN
output "backend_image_tag_parameter_arn" {
  description = "ARN of the SSM parameter storing the backend image tag."
  value       = aws_ssm_parameter.backend_image_tag.arn
}
