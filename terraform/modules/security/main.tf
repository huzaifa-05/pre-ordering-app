# ALB Security Group
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for the Application Load Balancer"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-${var.environment}-alb-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Allow HTTP from CloudFront only
resource "aws_security_group_rule" "alb_ingress_from_cloudfront" {
  type              = "ingress"
  description       = "Allow HTTP from CloudFront"
  security_group_id = aws_security_group.alb.id

  from_port       = 80
  to_port         = 80
  protocol        = "tcp"
  prefix_list_ids = [var.cloudfront_prefix_list_id]
}

# Allow ALB outbound traffic
resource "aws_security_group_rule" "alb_egress" {
  type              = "egress"
  description       = "Allow all outbound traffic"
  security_group_id = aws_security_group.alb.id

  from_port   = 0
  to_port     = 0
  protocol    = "-1"
  cidr_blocks = ["0.0.0.0/0"]
}


# EC2 Security Group
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-${var.environment}-ec2-sg"
  description = "Security group for backend EC2 instances"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Allow backend traffic from ALB only
resource "aws_security_group_rule" "ec2_ingress_from_alb" {
  type              = "ingress"
  description       = "Allow backend traffic from ALB"
  security_group_id = aws_security_group.ec2.id

  from_port                = var.backend_port
  to_port                  = var.backend_port
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.alb.id
}

# Allow EC2 outbound traffic
resource "aws_security_group_rule" "ec2_egress" {
  type              = "egress"
  description       = "Allow all outbound traffic"
  security_group_id = aws_security_group.ec2.id

  from_port   = 0
  to_port     = 0
  protocol    = "-1"
  cidr_blocks = ["0.0.0.0/0"]
}


# RDS Security Group
resource "aws_security_group" "rds" {
  name        = "${var.project_name}-${var.environment}-rds-sg"
  description = "Security group for the RDS database"
  vpc_id      = var.vpc_id

  tags = {
    Name        = "${var.project_name}-${var.environment}-rds-sg"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Allow MySQL traffic from EC2 only
resource "aws_security_group_rule" "rds_ingress_from_ec2" {
  type              = "ingress"
  description       = "Allow MySQL traffic from backend EC2"
  security_group_id = aws_security_group.rds.id

  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.ec2.id
}
