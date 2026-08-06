# Validates the dev Terraform configuration and creates a saved plan.
resource "aws_codebuild_project" "terraform_validate_plan" {
  name         = "${var.project_name}-tf-plan"
  service_role = aws_iam_role.terraform_codebuild.arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "terraform/buildspecs/validate-plan.yml"
  }

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux-x86_64-standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  tags = {
    Name = "${var.project_name}-tf-plan"
  }
}

# Applies the approved Terraform plan.
resource "aws_codebuild_project" "terraform_apply" {
  name         = "${var.project_name}-tf-apply"
  service_role = aws_iam_role.terraform_codebuild.arn

  source {
    type      = "CODEPIPELINE"
    buildspec = "terraform/buildspecs/apply.yml"
  }

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux-x86_64-standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  tags = {
    Name = "${var.project_name}-tf-apply"
  }
}
