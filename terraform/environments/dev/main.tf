module "storage" {
  source = "../../modules/storage"

  project_name = var.project_name
}

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
