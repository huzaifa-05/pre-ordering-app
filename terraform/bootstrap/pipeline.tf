# Unified Terraform pipeline for the dev environment.
resource "aws_codepipeline" "main" {
  name     = "${var.project_name}-pipeline"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }

  # Pull source code from the feature branch.
  stage {
    name = "Source"

    action {
      name             = "GitHubSource"
      category         = "Source"
      owner            = "AWS"
      provider         = "CodeStarSourceConnection"
      version          = "1"
      output_artifacts = ["SourceArtifact"]

      configuration = {
        ConnectionArn    = aws_codeconnections_connection.github.arn
        FullRepositoryId = var.github_repository
        BranchName       = var.github_branch
        DetectChanges    = "true"
      }
    }
  }

  # Validate the Terraform code and create a saved plan.
  stage {
    name = "ValidateAndPlan"

    action {
      name             = "TerraformValidatePlan"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["SourceArtifact"]
      output_artifacts = ["TerraformPlanArtifact"]

      configuration = {
        ProjectName = aws_codebuild_project.terraform_validate_plan.name
      }
    }
  }

  # Pause until the Terraform plan is manually approved.
  stage {
    name = "Approval"

    action {
      name     = "ApproveTerraformPlan"
      category = "Approval"
      owner    = "AWS"
      provider = "Manual"
      version  = "1"
    }
  }

  # Apply the exact Terraform plan created before approval.
  stage {
    name = "Apply"

    action {
      name     = "TerraformApply"
      category = "Build"
      owner    = "AWS"
      provider = "CodeBuild"
      version  = "1"
      input_artifacts = [
        "SourceArtifact",
        "TerraformPlanArtifact"
      ]

      configuration = {
        ProjectName   = aws_codebuild_project.terraform_apply.name
        PrimarySource = "SourceArtifact"
      }
    }
  }

  tags = {
    Name = "${var.project_name}-pipeline"
  }

  depends_on = [
    aws_iam_role_policy.codepipeline,
    aws_iam_role_policy.terraform_codebuild
  ]
}
