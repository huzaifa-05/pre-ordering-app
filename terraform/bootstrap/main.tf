# Read the AWS account ID from the credentials currently used by Terraform.
data "aws_caller_identity" "current" {}

locals {
  account_id = data.aws_caller_identity.current.account_id

  terraform_state_bucket_name = "${var.project_name}-tfstate-${local.account_id}"

  pipeline_artifact_bucket_name = "${var.project_name}-pipeline-artifacts-${local.account_id}"
}

# Stores Terraform state remotely.
resource "aws_s3_bucket" "terraform_state" {
  bucket = local.terraform_state_bucket_name

  # Protect the state bucket from accidental terraform destroy.
  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Name = "${var.project_name}-tfstate"
  }
}

# Keeps previous state versions for recovery.
resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypts the Terraform state stored in S3.
resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Prevents public access to the Terraform state bucket.
resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Disables ACL-based ownership and makes the account own all objects.
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

# Keeps previous versions of pipeline artifacts.
resource "aws_s3_bucket_versioning" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Encrypts pipeline artifacts stored in S3.
resource "aws_s3_bucket_server_side_encryption_configuration" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Prevents public access to the pipeline artifact bucket.
resource "aws_s3_bucket_public_access_block" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Makes the AWS account the owner of uploaded pipeline artifacts.
resource "aws_s3_bucket_ownership_controls" "pipeline_artifacts" {
  bucket = aws_s3_bucket.pipeline_artifacts.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}
############################################################################
# Connects CodePipeline to the GitHub repository.
# Existing authorized GitHub connection imported into Terraform.
resource "aws_codeconnections_connection" "github" {
  name          = "internship-2026-b"
  provider_type = "GitHub"

  lifecycle {
    prevent_destroy = true
  }
}
