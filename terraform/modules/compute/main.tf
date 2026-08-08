# EC2 IAM trust policy
data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

# Current AWS region
data "aws_region" "current" {}

# Latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# IAM role for backend EC2 instances
resource "aws_iam_role" "ec2" {
  name               = "${var.project_name}-${var.environment}-ec2-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json

  tags = {
    Name        = "${var.project_name}-${var.environment}-ec2-role"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Allow EC2 management through Systems Manager
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Allow EC2 to pull images from ECR
resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Instance profile attaches the IAM role to EC2
resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-${var.environment}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# Launch template for backend EC2 instances
resource "aws_launch_template" "backend" {
  name_prefix   = "${var.project_name}-${var.environment}-backend-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.instance_type

  # Attach IAM instance profile
  iam_instance_profile {
    name = aws_iam_instance_profile.ec2.name
  }

  # Attach backend security group
  vpc_security_group_ids = [
    var.ec2_security_group_id
  ]

  # Require IMDSv2
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }
  # Bootstrap backend EC2 instances
  user_data = base64encode(templatefile(
    "${path.module}/user_data.sh.tpl",
    {
      aws_region     = data.aws_region.current.name
      ecr_registry   = split("/", var.repository_url)[0]
      repository_url = var.repository_url
      image_tag      = var.image_tag
      backend_port   = var.backend_port
    }
  ))

  # Tag launched EC2 instances
  tag_specifications {
    resource_type = "instance"

    tags = {
      Name        = "${var.project_name}-${var.environment}-backend"
      Project     = var.project_name
      Environment = var.environment
    }
  }

  # Tag attached EBS volumes
  tag_specifications {
    resource_type = "volume"

    tags = {
      Project     = var.project_name
      Environment = var.environment
    }
  }

  # Use newest launch template version
  update_default_version = true
}

# Auto Scaling Group for backend EC2 instances
resource "aws_autoscaling_group" "backend" {
  name = "${var.project_name}-${var.environment}-backend-asg"

  min_size         = var.min_size
  desired_capacity = var.desired_capacity
  max_size         = var.max_size

  # Deploy EC2 instances in private subnets
  vpc_zone_identifier = var.private_subnet_ids

  # Register instances with ALB target group
  target_group_arns = [
    var.target_group_arn
  ]

  # Use ALB health checks
  health_check_type         = "ELB"
  health_check_grace_period = 180

  # Use backend launch template
  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }

  # Propagate Name tag
  tag {
    key                 = "Name"
    value               = "${var.project_name}-${var.environment}-backend"
    propagate_at_launch = true
  }

  # Propagate Project tag
  tag {
    key                 = "Project"
    value               = var.project_name
    propagate_at_launch = true
  }

  # Propagate Environment tag
  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  # Roll out launch template updates safely
  instance_refresh {
    strategy = "Rolling"

    preferences {
      min_healthy_percentage = 50
    }
  }
}

# Scale capacity based on average CPU
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "${var.project_name}-${var.environment}-cpu-scaling"
  autoscaling_group_name = aws_autoscaling_group.backend.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }

    target_value = var.target_cpu_utilization
  }
}
