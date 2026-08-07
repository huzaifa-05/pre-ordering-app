# Get the current AWS account ID for globally unique bucket names.
data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  terraform_state_bucket_name   = "${var.project_name}-tfstate-${local.account_id}"
  pipeline_artifact_bucket_name = "${var.project_name}-pipeline-artifacts-${local.account_id}"
}

# Stores Terraform state.
resource "aws_s3_bucket" "terraform_state" {
  bucket = local.terraform_state_bucket_name

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "${var.project_name}-tfstate"
  }
}

# Enable versioning for Terraform state recovery.
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt Terraform state at rest.
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to Terraform state.
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# AWS account owns all Terraform state objects.
resource "aws_s3_bucket_ownership_controls" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Stores artifacts passed between CodePipeline stages.
resource "aws_s3_bucket" "pipeline_artifacts" {
  bucket = local.pipeline_artifact_bucket_name

  tags = {
    Name = "${var.project_name}-pipeline-artifacts"
  }
}

# Enable versioning for pipeline artifacts.
resource "aws_s3_bucket_versioning" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypt pipeline artifacts at rest.
resource "aws_s3_bucket_server_side_encryption_configuration" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block public access to the artifact bucket.
resource "aws_s3_bucket_public_access_block" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# AWS account owns all pipeline artifact objects.
resource "aws_s3_bucket_ownership_controls" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
