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
