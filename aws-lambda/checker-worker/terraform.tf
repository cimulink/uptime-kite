# Terraform configuration for UptimeKite Checker Worker Lambda function

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "uptimekite"
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
}

variable "sqs_queue_url" {
  description = "SQS queue URL"
  type        = string
}

# Lambda function
resource "aws_lambda_function" "checker_worker" {
  filename         = "checker-worker.zip"
  function_name    = "${var.project_name}-checker-worker"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  source_code_hash = filebase64sha256("checker-worker.zip")

  environment {
    variables = {
      DATABASE_URL = var.database_url
      AWS_REGION   = var.aws_region
      AWS_SQS_URL  = var.sqs_queue_url
    }
  }

  # Timeout and memory settings
  timeout     = 300  # 5 minutes
  memory_size = 512  # 512 MB
}

# IAM role for Lambda function
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for Lambda function
resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Resource = var.sqs_queue_url
      }
    ]
  })
}

# Event source mapping for SQS
resource "aws_lambda_event_source_mapping" "sqs_trigger" {
  event_source_arn = var.sqs_queue_url
  function_name    = aws_lambda_function.checker_worker.arn
  batch_size       = 10
}

# CloudWatch log group for Lambda function
resource "aws_cloudwatch_log_group" "lambda_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.checker_worker.function_name}"
  retention_in_days = 14
}

# Outputs
output "lambda_function_name" {
  value = aws_lambda_function.checker_worker.function_name
}

output "lambda_function_arn" {
  value = aws_lambda_function.checker_worker.arn
}
