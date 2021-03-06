locals {
  account_id = data.aws_caller_identity.current.account_id
}

data "aws_iam_policy_document" "ecs-assume-role-policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type = "Service"
      identifiers = [
        "ecs-tasks.amazonaws.com"
      ]
    }
  }
}

resource "aws_iam_role" "ehr-repo" {
  name               = "${var.environment}-${var.component_name}-EcsTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs-assume-role-policy.json
  description        = "Role assumed by ${var.component_name} ECS task"
}

data "aws_iam_policy_document" "ehr-repo-s3" {
  statement {
    actions = [
      "s3:PutObject",
      "s3:GetObject"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}/*"
    ]
  }
}

data "aws_iam_policy_document" "ecr_policy_doc" {
  statement {
    actions = [
      "ecr:*"
    ]

    resources = [
      "arn:aws:ecr:${var.region}:${local.account_id}:repository/deductions/${var.component_name}"
    ]
  }
  statement {
    actions = [
      "ecr:GetAuthorizationToken"
    ]

    resources = [
      "*"
    ]
  }
}

data "aws_iam_policy_document" "logs_policy_doc" {
  statement {
    actions = [
      "logs:*"
    ]

    resources = [
      "*"
    ]
  }
}

resource "aws_iam_policy" "ehr-repo-s3" {
  name   = "${var.environment}-ehr-repo-s3"
  policy = data.aws_iam_policy_document.ehr-repo-s3.json
}

resource "aws_iam_policy" "ehr-ecr" {
  name   = "${var.environment}-ehr-repo-ecr"
  policy = data.aws_iam_policy_document.ecr_policy_doc.json
}

resource "aws_iam_policy" "ehr-logs" {
  name   = "${var.environment}-ehr-logs"
  policy = data.aws_iam_policy_document.logs_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ehr-repo-s3-attach" {
  role       = aws_iam_role.ehr-repo.name
  policy_arn = aws_iam_policy.ehr-repo-s3.arn
}

resource "aws_iam_role_policy_attachment" "ehr-ecr-attach" {
  role       = aws_iam_role.ehr-repo.name
  policy_arn = aws_iam_policy.ehr-ecr.arn
}

resource "aws_iam_role_policy_attachment" "ehr-logs" {
  role       = aws_iam_role.ehr-repo.name
  policy_arn = aws_iam_policy.ehr-logs.arn
}

data "aws_iam_policy_document" "ssm_policy_doc" {
  statement {
    actions = [
      "ssm:*"
    ]

    resources = [
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/NHS/${var.environment}-${local.account_id}/${var.component_name}/authorization_keys",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/NHS/${var.environment}-${local.account_id}/core/rds_endpoint",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/nhs/${var.environment}/db/db-username",
      "arn:aws:ssm:${var.region}:${local.account_id}:parameter/nhs/${var.environment}/db/db-password"
    ]
  }
}

resource "aws_iam_policy" "ssm_policy" {
  name   = "${var.environment}-${var.component_name}-ssm"
  policy = data.aws_iam_policy_document.ssm_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "ssm_policy_attach" {
  role       = aws_iam_role.ehr-repo.name
  policy_arn = aws_iam_policy.ssm_policy.arn
}

data "aws_iam_policy_document" "ehr-repo-s3-bucket" {
  statement {
    actions = [
      "s3:ListBucket"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket_name}"
    ]
  }
}

resource "aws_iam_policy" "ehr-repo-s3-bucket" {
  name   = "${var.environment}-ehr-repo-s3-bucket"
  policy = data.aws_iam_policy_document.ehr-repo-s3-bucket.json
}

resource "aws_iam_role_policy_attachment" "ehr-repo-s3-bucket-attach" {
  role       = aws_iam_role.ehr-repo.name
  policy_arn = aws_iam_policy.ehr-repo-s3-bucket.arn
}
