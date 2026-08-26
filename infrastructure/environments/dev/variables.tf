variable "project_name" {
  description = "Short project name used in Azure resource names."
  type        = string
}

variable "environment" {
  description = "Deployment environment, such as dev or prod."
  type        = string
}

variable "location" {
  description = "Azure region in which to create resources."
  type        = string
}