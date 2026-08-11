# ALB ARN
output "alb_arn" {
  description = "ARN of the Application Load Balancer."
  value       = aws_lb.main.arn
}

# ALB DNS name
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer."
  value       = aws_lb.main.dns_name
}

# Blue target group ARN
output "blue_target_group_arn" {
  description = "ARN of the blue backend target group."
  value       = aws_lb_target_group.backend.arn
}

# Green target group ARN
output "green_target_group_arn" {
  description = "ARN of the green backend target group."
  value       = aws_lb_target_group.green.arn
}

# ALB listener ARN
output "listener_arn" {
  description = "ARN of the backend ALB listener."
  value       = aws_lb_listener.http.arn
}
