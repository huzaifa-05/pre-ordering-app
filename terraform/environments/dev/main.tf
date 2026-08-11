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

  ecr_repository_url             = module.ecr.repository_url
  ecr_repository_arn             = module.ecr.repository_arn
  blue_autoscaling_group_name    = module.compute.blue_autoscaling_group_name
  green_autoscaling_group_name   = module.compute.green_autoscaling_group_name
  backend_desired_capacity       = var.desired_capacity
  blue_image_tag_parameter_name  = module.compute.blue_image_tag_parameter_name
  green_image_tag_parameter_name = module.compute.green_image_tag_parameter_name
  blue_image_tag_parameter_arn   = module.compute.blue_image_tag_parameter_arn
  green_image_tag_parameter_arn  = module.compute.green_image_tag_parameter_arn
  blue_target_group_arn          = module.alb.blue_target_group_arn
  green_target_group_arn         = module.alb.green_target_group_arn
  alb_listener_arn               = module.alb.listener_arn
  frontend_bucket_name           = module.frontend_hosting.bucket_name
  frontend_bucket_arn            = module.frontend_hosting.bucket_arn
  cloudfront_distribution_id     = module.frontend_hosting.cloudfront_distribution_id
  cognito_user_pool_id           = module.auth.user_pool_id
  cognito_user_pool_client_id    = module.auth.user_pool_client_id
  backend_api_url                = "/api"
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
  blue_target_group_arn  = module.alb.blue_target_group_arn
  green_target_group_arn = module.alb.green_target_group_arn
  repository_url         = module.ecr.repository_url
  backend_port           = var.backend_port
  instance_type          = var.instance_type
  min_size               = var.min_size
  desired_capacity       = var.desired_capacity
  max_size               = var.max_size
  target_cpu_utilization = var.target_cpu_utilization
  image_tag              = var.image_tag

  aurora_cluster_endpoint     = module.database.cluster_endpoint
  database_name               = module.database.database_name
  database_secret_arn         = module.database.master_user_secret_arn
  cognito_user_pool_id        = module.auth.user_pool_id
  cognito_user_pool_client_id = module.auth.user_pool_client_id
}

# Cognito authentication module
module "auth" {
  source = "../../modules/auth"

  project_name = var.project_name
  environment  = var.environment
}

# Frontend hosting module
module "frontend_hosting" {
  source = "../../modules/frontend_hosting"

  project_name = var.project_name
  environment  = var.environment
  alb_dns_name = module.alb.alb_dns_name
}

# Aurora database module
module "database" {
  source = "../../modules/database"

  project_name          = var.project_name
  environment           = var.environment
  private_subnet_ids    = module.networking.private_subnet_ids
  rds_security_group_id = module.security.rds_security_group_id

  database_name      = var.database_name
  db_master_username = var.db_master_username
  db_instance_class  = var.db_instance_class
  engine_version     = var.db_engine_version

  backup_retention_period = var.db_backup_retention_period
  deletion_protection     = var.db_deletion_protection
  skip_final_snapshot     = var.db_skip_final_snapshot
}
