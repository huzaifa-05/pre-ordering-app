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

data "aws_caller_identity" "current" {}

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

resource "aws_iam_role" "application_codebuild" {
  name               = "${var.project_name}-app-cb-role"
  assume_role_policy = data.aws_iam_policy_document.codebuild_assume_role.json

  tags = {
    Name = "${var.project_name}-app-cb-role"
  }
}

data "aws_iam_policy_document" "application_codebuild" {
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
    sid    = "ListPipelineArtifactBucket"
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket"
    ]
    resources = [var.artifact_bucket_arn]
  }

  statement {
    sid       = "GetEcrAuthorization"
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid    = "PushBackendImage"
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:DescribeRepositories",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart"
    ]
    resources = [var.ecr_repository_arn]
  }

  statement {
    sid    = "UpdateBackendImageTags"
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:PutParameter"
    ]
    resources = [
      var.blue_image_tag_parameter_arn,
      var.green_image_tag_parameter_arn
    ]
  }

  statement {
    sid    = "ReadBlueGreenDeploymentState"
    effect = "Allow"
    actions = [
      "elasticloadbalancing:DescribeListeners",
      "elasticloadbalancing:DescribeTargetHealth",
      "autoscaling:DescribeAutoScalingGroups"
    ]
    resources = ["*"]
  }

  statement {
    sid       = "SwitchBackendListener"
    effect    = "Allow"
    actions   = ["elasticloadbalancing:ModifyListener"]
    resources = [var.alb_listener_arn]
  }

  statement {
    sid    = "ScaleBlueGreenAsgs"
    effect = "Allow"
    actions = [
      "autoscaling:UpdateAutoScalingGroup"
    ]
    resources = [
      "arn:aws:autoscaling:${var.aws_region}:${data.aws_caller_identity.current.account_id}:autoScalingGroup:*:autoScalingGroupName/${var.blue_autoscaling_group_name}",
      "arn:aws:autoscaling:${var.aws_region}:${data.aws_caller_identity.current.account_id}:autoScalingGroup:*:autoScalingGroupName/${var.green_autoscaling_group_name}"
    ]
  }

  statement {
    sid    = "ListFrontendBucket"
    effect = "Allow"
    actions = [
      "s3:GetBucketLocation",
      "s3:ListBucket"
    ]
    resources = [var.frontend_bucket_arn]
  }

  statement {
    sid    = "SyncFrontendObjects"
    effect = "Allow"
    actions = [
      "s3:DeleteObject",
      "s3:GetObject",
      "s3:PutObject"
    ]
    resources = ["${var.frontend_bucket_arn}/*"]
  }

  statement {
    sid       = "InvalidateFrontendDistribution"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = ["arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${var.cloudfront_distribution_id}"]
  }

  statement {
    sid    = "WriteCodeBuildLogs"
    effect = "Allow"
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "application_codebuild" {
  name   = "${var.project_name}-app-cb-policy"
  role   = aws_iam_role.application_codebuild.id
  policy = data.aws_iam_policy_document.application_codebuild.json
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
      aws_codebuild_project.terraform_apply.arn,
      aws_codebuild_project.backend_deploy.arn,
      aws_codebuild_project.frontend_deploy.arn
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

resource "aws_codebuild_project" "backend_deploy" {
  name         = "${var.project_name}-backend-deploy"
  service_role = aws_iam_role.application_codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux-x86_64-standard:5.0"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true
    type                        = "LINUX_CONTAINER"

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "ECR_REPOSITORY_URL"
      value = var.ecr_repository_url
    }

    environment_variable {
      name  = "ALB_LISTENER_ARN"
      value = var.alb_listener_arn
    }

    environment_variable {
      name  = "BLUE_TARGET_GROUP_ARN"
      value = var.blue_target_group_arn
    }

    environment_variable {
      name  = "GREEN_TARGET_GROUP_ARN"
      value = var.green_target_group_arn
    }

    environment_variable {
      name  = "BLUE_ASG_NAME"
      value = var.blue_autoscaling_group_name
    }

    environment_variable {
      name  = "GREEN_ASG_NAME"
      value = var.green_autoscaling_group_name
    }

    environment_variable {
      name  = "BLUE_IMAGE_TAG_PARAMETER_NAME"
      value = var.blue_image_tag_parameter_name
    }

    environment_variable {
      name  = "GREEN_IMAGE_TAG_PARAMETER_NAME"
      value = var.green_image_tag_parameter_name
    }

    environment_variable {
      name  = "BACKEND_DESIRED_CAPACITY"
      value = tostring(var.backend_desired_capacity)
    }
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "terraform/buildspec-backend.yml"
  }

  tags = {
    Name = "${var.project_name}-backend-deploy"
  }

  depends_on = [aws_iam_role_policy.application_codebuild]
}

resource "aws_codebuild_project" "frontend_deploy" {
  name         = "${var.project_name}-frontend-deploy"
  service_role = aws_iam_role.application_codebuild.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux-x86_64-standard:5.0"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false
    type                        = "LINUX_CONTAINER"

    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "FRONTEND_BUCKET_NAME"
      value = var.frontend_bucket_name
    }

    environment_variable {
      name  = "CLOUDFRONT_DISTRIBUTION_ID"
      value = var.cloudfront_distribution_id
    }

    environment_variable {
      name  = "VITE_AUTH_PROVIDER"
      value = "cognito"
    }

    environment_variable {
      name  = "VITE_COGNITO_REGION"
      value = var.aws_region
    }

    environment_variable {
      name  = "VITE_COGNITO_USER_POOL_ID"
      value = var.cognito_user_pool_id
    }

    environment_variable {
      name  = "VITE_COGNITO_CLIENT_ID"
      value = var.cognito_user_pool_client_id
    }

    environment_variable {
      name  = "VITE_API_BASE_URL"
      value = var.backend_api_url
    }
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "terraform/buildspec-frontend.yml"
  }

  tags = {
    Name = "${var.project_name}-frontend-deploy"
  }

  depends_on = [aws_iam_role_policy.application_codebuild]
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

  stage {
    name = "BackendBuildDeploy"

    action {
      name            = "BackendBuildDeploy"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["SourceArtifact"]

      configuration = {
        ProjectName = aws_codebuild_project.backend_deploy.name
      }
    }
  }

  stage {
    name = "FrontendBuildDeploy"

    action {
      name            = "FrontendBuildDeploy"
      category        = "Build"
      owner           = "AWS"
      provider        = "CodeBuild"
      version         = "1"
      input_artifacts = ["SourceArtifact"]

      configuration = {
        ProjectName = aws_codebuild_project.frontend_deploy.name
      }
    }
  }

  tags = {
    Name = "${var.project_name}-pipeline"
  }

  depends_on = [
    aws_iam_role_policy.codepipeline,
    aws_iam_role_policy_attachment.terraform_codebuild_admin,
    aws_iam_role_policy.application_codebuild
  ]
}
