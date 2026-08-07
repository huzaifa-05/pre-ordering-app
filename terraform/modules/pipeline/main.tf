data "aws_iam_policy_document" "codebuild_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["codebuild.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "terraform_codebuild" {
  name               = "${var.project_name}-tf-cb-role"
  assume_role_policy = data.aws_iam_policy_document.codebuild_assume_role.json

  tags = {
    Name = "${var.project_name}-tf-cb-role"
  }
}

# Terraform execution is intentionally broad for this project phase.
resource "aws_iam_role_policy_attachment" "terraform_codebuild_admin" {
  role       = aws_iam_role.terraform_codebuild.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

data "aws_iam_policy_document" "codepipeline_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["codepipeline.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "codepipeline" {
  name               = "${var.project_name}-cp-role"
  assume_role_policy = data.aws_iam_policy_document.codepipeline_assume_role.json

  tags = {
    Name = "${var.project_name}-cp-role"
  }
}

data "aws_iam_policy_document" "codepipeline" {
  statement {
    sid       = "UseGitHubConnection"
    effect    = "Allow"
    actions   = ["codeconnections:UseConnection"]
    resources = [var.github_connection_arn]
  }

  statement {
    sid    = "ListArtifactBucket"
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:ListBucket"
    ]
    resources = [var.artifact_bucket_arn]
  }

  statement {
    sid    = "AccessPipelineArtifacts"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:PutObject"
    ]
    resources = ["${var.artifact_bucket_arn}/*"]
  }

  statement {
    sid    = "RunTerraformBuilds"
    effect = "Allow"
    actions = [
      "codebuild:StartBuild",
      "codebuild:BatchGetBuilds"
    ]
    resources = [
      aws_codebuild_project.terraform_plan.arn,
      aws_codebuild_project.terraform_apply.arn
    ]
  }
}

resource "aws_iam_role_policy" "codepipeline" {
  name   = "${var.project_name}-cp-policy"
  role   = aws_iam_role.codepipeline.id
  policy = data.aws_iam_policy_document.codepipeline.json
}

resource "aws_codebuild_project" "terraform_plan" {
  name         = "${var.project_name}-tf-plan"
  service_role = aws_iam_role.terraform_codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux-x86_64-standard:5.0"
    image_pull_credentials_type = "CODEBUILD"
    type                        = "LINUX_CONTAINER"
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "terraform/buildspec-plan.yml"
  }

  tags = {
    Name = "${var.project_name}-tf-plan"
  }
}

resource "aws_codebuild_project" "terraform_apply" {
  name         = "${var.project_name}-tf-apply"
  service_role = aws_iam_role.terraform_codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux-x86_64-standard:5.0"
    image_pull_credentials_type = "CODEBUILD"
    type                        = "LINUX_CONTAINER"
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "terraform/buildspec-apply.yml"
  }

  tags = {
    Name = "${var.project_name}-tf-apply"
  }
}

resource "aws_codepipeline" "main" {
  name     = "${var.project_name}-pipeline"
  role_arn = aws_iam_role.codepipeline.arn

  artifact_store {
    location = var.artifact_bucket_name
    type     = "S3"
  }

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
        ConnectionArn    = var.github_connection_arn
        FullRepositoryId = var.github_repository
        BranchName       = var.github_branch
        DetectChanges    = "true"
      }
    }
  }

  stage {
    name = "TerraformValidatePlan"

    action {
      name             = "TerraformValidatePlan"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["SourceArtifact"]
      output_artifacts = ["TerraformPlanArtifact"]

      configuration = {
        ProjectName = aws_codebuild_project.terraform_plan.name
      }
    }
  }

  stage {
    name = "ManualApproval"

    action {
      name     = "ApproveTerraformPlan"
      category = "Approval"
      owner    = "AWS"
      provider = "Manual"
      version  = "1"
    }
  }

  stage {
    name = "TerraformApply"

    action {
      name            = "TerraformApply"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["SourceArtifact", "TerraformPlanArtifact"]

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
    aws_iam_role_policy_attachment.terraform_codebuild_admin
  ]
}
