# Blue Auto Scaling Group name
output "blue_autoscaling_group_name" {
  description = "Name of the blue backend Auto Scaling Group."
  value       = aws_autoscaling_group.backend.name
}

# Green Auto Scaling Group name
output "green_autoscaling_group_name" {
  description = "Name of the green backend Auto Scaling Group."
  value       = aws_autoscaling_group.green_backend.name
}

# Blue Launch Template ID
output "blue_launch_template_id" {
  description = "ID of the blue backend EC2 Launch Template."
  value       = aws_launch_template.backend.id
}

# Green Launch Template ID
output "green_launch_template_id" {
  description = "ID of the green backend EC2 Launch Template."
  value       = aws_launch_template.green_backend.id
}

# EC2 IAM role ARN
output "ec2_role_arn" {
  description = "ARN of the IAM role attached to backend EC2 instances."
  value       = aws_iam_role.ec2.arn
}

# Blue backend image tag parameter name
output "blue_image_tag_parameter_name" {
  description = "Name of the SSM parameter storing the blue backend image tag."
  value       = aws_ssm_parameter.backend_image_tag.name
}

# Green backend image tag parameter name
output "green_image_tag_parameter_name" {
  description = "Name of the SSM parameter storing the green backend image tag."
  value       = aws_ssm_parameter.green_backend_image_tag.name
}

# Blue backend image tag parameter ARN
output "blue_image_tag_parameter_arn" {
  description = "ARN of the SSM parameter storing the blue backend image tag."
  value       = aws_ssm_parameter.backend_image_tag.arn
}

# Green backend image tag parameter ARN
output "green_image_tag_parameter_arn" {
  description = "ARN of the SSM parameter storing the green backend image tag."
  value       = aws_ssm_parameter.green_backend_image_tag.arn
}
