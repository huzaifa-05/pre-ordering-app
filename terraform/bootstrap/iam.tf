# ------------------------------------------------------------
# IAM role assumed by CodeBuild during Terraform execution.
# ------------------------------------------------------------
data "aws_iam_policy_document" "codebuild_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

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

# ------------------------------------------------------------
# Permissions required by CodeBuild to run Terraform.
# Additional AWS service permissions will be added as
# infrastructure modules are introduced.
# ------------------------------------------------------------
data "aws_iam_policy_document" "terraform_codebuild" {

  # Allows verification of the IAM identity during pipeline execution.
  statement {
    sid       = "IdentifyBuildRole"
    effect    = "Allow"
    actions   = ["sts:GetCallerIdentity"]
    resources = ["*"]
  }

  # Allows CodeBuild to write build logs to CloudWatch.
  statement {
    sid    = "WriteBuildLogs"
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]

    resources = [
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/codebuild/${var.project_name}-tf-*",
      "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/codebuild/${var.project_name}-tf-*:*"
    ]
  }

  # Allows access to the Terraform state bucket and pipeline artifact bucket.
  statement {
    sid    = "ListTerraformBuckets"
    effect = "Allow"

    actions = [
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:ListBucket"
    ]

    resources = [
      aws_s3_bucket.terraform_state.arn,
      aws_s3_bucket.pipeline_artifacts.arn
    ]
  }

  # Allows reading and updating Terraform state and pipeline artifacts.
  statement {
    sid    = "AccessTerraformStateAndArtifacts"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:PutObject",
      "s3:DeleteObject"
    ]

    resources = [
      "${aws_s3_bucket.terraform_state.arn}/*",
      "${aws_s3_bucket.pipeline_artifacts.arn}/*"
    ]
  }
}

# Attach the permissions policy to the CodeBuild IAM role.
resource "aws_iam_role_policy" "terraform_codebuild" {
  name   = "${var.project_name}-tf-cb-policy"
  role   = aws_iam_role.terraform_codebuild.id
  policy = data.aws_iam_policy_document.terraform_codebuild.json
}

# ------------------------------------------------------------
# IAM role assumed by CodePipeline.
# ------------------------------------------------------------
data "aws_iam_policy_document" "codepipeline_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

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

# Permissions required by CodePipeline to use GitHub,
# exchange artifacts, and start Terraform CodeBuild projects.
data "aws_iam_policy_document" "codepipeline" {
  statement {
    sid       = "UseGitHubConnection"
    effect    = "Allow"
    actions   = ["codeconnections:UseConnection"]
    resources = [aws_codeconnections_connection.github.arn]
  }

  statement {
    sid    = "ListArtifactBucket"
    effect = "Allow"

    actions = [
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:ListBucket"
    ]

    resources = [
      aws_s3_bucket.pipeline_artifacts.arn
    ]
  }

  statement {
    sid    = "AccessPipelineArtifacts"
    effect = "Allow"

    actions = [
      "s3:GetObject",
      "s3:GetObjectVersion",
      "s3:PutObject"
    ]

    resources = [
      "${aws_s3_bucket.pipeline_artifacts.arn}/*"
    ]
  }

  statement {
    sid    = "RunTerraformBuilds"
    effect = "Allow"

    actions = [
      "codebuild:StartBuild",
      "codebuild:BatchGetBuilds"
    ]

    resources = [
      "arn:aws:codebuild:${var.aws_region}:${data.aws_caller_identity.current.account_id}:project/${var.project_name}-tf-*"
    ]
  }
}

resource "aws_iam_role_policy" "codepipeline" {
  name   = "${var.project_name}-cp-policy"
  role   = aws_iam_role.codepipeline.id
  policy = data.aws_iam_policy_document.codepipeline.json
}
