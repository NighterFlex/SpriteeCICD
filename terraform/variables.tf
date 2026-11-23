variable "aws_region" {
  description = "AWS region for the Spritee staging stack."
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Project tag applied to managed resources."
  type        = string
  default     = "Spritee"
}

variable "environment" {
  description = "Environment tag applied to managed resources."
  type        = string
  default     = "staging"
}

variable "owner" {
  description = "Owner tag applied to managed resources."
  type        = string
  default     = "Group9"
}

variable "cost_center" {
  description = "Cost center tag applied to managed resources."
  type        = string
  default     = "cloud-computing"
}

variable "container_port" {
  description = "Port exposed by the Spritee container."
  type        = number
  default     = 80
}

variable "low_cost_mode" {
  description = "Omit NAT and load-balancing resources and run tasks in public subnets."
  type        = bool
  default     = true
}

variable "desired_count" {
  description = "Desired task count in low-cost mode; defaults to zero to avoid Fargate task charges."
  type        = number
  default     = 0
}

variable "allowed_cidr" {
  description = "CIDR allowed to access the container directly in low-cost mode."
  type        = string
  default     = "0.0.0.0/0"
}

variable "enable_nat_gateway" {
  description = "Whether private subnet routes use NAT for internet egress."
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use one shared NAT gateway instead of one per public subnet."
  type        = bool
  default     = true
}

variable "acm_certificate_arn" {
  description = "Optional ACM certificate ARN for HTTPS on the load balancer."
  type        = string
  default     = ""
}

variable "alert_email" {
  description = "Optional email address subscribed to infrastructure alarms."
  type        = string
  default     = ""
}

variable "enable_cloudtrail" {
  description = "Whether to create a multi-region CloudTrail trail."
  type        = bool
  default     = false
}
