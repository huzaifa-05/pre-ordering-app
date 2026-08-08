# Storage module
module "storage" {
  source = "../../modules/storage"

  project_name = var.project_name
}

# CI/CD pipeline module
module "pipeline" {
  source = "../../modules/pipeline"

  project_name          = var.project_name
  environment           = var.environment
  aws_region            = var.aws_region
  github_repository     = var.github_repository
  github_branch         = var.github_branch
  github_connection_arn = var.github_connection_arn

  artifact_bucket_name = module.storage.pipeline_artifact_bucket_name
  artifact_bucket_arn  = module.storage.pipeline_artifact_bucket_arn
  state_bucket_arn     = module.storage.terraform_state_bucket_arn
}

# Networking module
module "networking" {
  source = "../../modules/networking"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
}

# Get AWS-managed CloudFront origin-facing prefix list
data "aws_ec2_managed_prefix_list" "cloudfront" {
  name = "com.amazonaws.global.cloudfront.origin-facing"
}

# Security module
module "security" {
  source = "../../modules/security"

  project_name              = var.project_name
  environment               = var.environment
  vpc_id                    = module.networking.vpc_id
  backend_port              = var.backend_port
  cloudfront_prefix_list_id = data.aws_ec2_managed_prefix_list.cloudfront.id
}
# ECR module
module "ecr" {
  source = "../../modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}
# ALB module
module "alb" {
  source = "../../modules/alb"

  project_name          = var.project_name
  environment           = var.environment
  vpc_id                = module.networking.vpc_id
  public_subnet_ids     = module.networking.public_subnet_ids
  alb_security_group_id = module.security.alb_security_group_id
  backend_port          = var.backend_port
}

# Compute module
module "compute" {
  source = "../../modules/compute"

  project_name           = var.project_name
  environment            = var.environment
  private_subnet_ids     = module.networking.private_subnet_ids
  ec2_security_group_id  = module.security.ec2_security_group_id
  target_group_arn       = module.alb.target_group_arn
  repository_url         = module.ecr.repository_url
  backend_port           = var.backend_port
  instance_type          = var.instance_type
  min_size               = var.min_size
  desired_capacity       = var.desired_capacity
  max_size               = var.max_size
  target_cpu_utilization = var.target_cpu_utilization
  image_tag              = var.image_tag
}
