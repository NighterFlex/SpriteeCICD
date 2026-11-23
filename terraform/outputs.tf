output "alb_dns_name" {
  description = "Public DNS name of the Spritee Application Load Balancer."
  value       = var.low_cost_mode ? null : aws_lb.this[0].dns_name
}

output "ecr_repository_url" {
  description = "URL of the Spritee ECR image repository."
  value       = aws_ecr_repository.spritee.repository_url
}

output "pipeline_name" {
  description = "CodePipeline deployment pipeline name."
  value       = aws_codepipeline.webapp.name
}

output "codebuild_project" {
  description = "CodeBuild project name."
  value       = aws_codebuild_project.spritee.name
}

output "ecs_cluster" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.this.name
}

output "ecs_service" {
  description = "ECS service name."
  value       = aws_ecs_service.spritee.name
}

output "target_group_arn" {
  description = "ALB target group ARN used by the ECS service."
  value       = var.low_cost_mode ? null : aws_lb_target_group.this[0].arn
}

output "github_connection_arn" {
  description = "CodeStar connection ARN; authorize it in the AWS console after creation."
  value       = aws_codestarconnections_connection.github.arn
}

output "low_cost_mode" {
  description = "Whether the low-cost infrastructure mode is enabled."
  value       = var.low_cost_mode
}
