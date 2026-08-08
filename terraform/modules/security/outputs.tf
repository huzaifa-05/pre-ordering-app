# ALB Security Group ID
output "alb_security_group_id" {
  description = "ID of the ALB security group."
  value       = aws_security_group.alb.id
}

# EC2 Security Group ID
output "ec2_security_group_id" {
  description = "ID of the EC2 security group."
  value       = aws_security_group.ec2.id
}

# RDS Security Group ID
output "rds_security_group_id" {
  description = "ID of the RDS security group."
  value       = aws_security_group.rds.id
}
