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

variable "subscription_id" {
  description = "Azure subscription containing the existing resource group."
  type        = string
}

variable "acr_name" {
  description = "Name of the existing shared Azure Container Registry."
  type        = string
}

variable "acr_resource_group_name" {
  description = "Name of the resource group containing the shared Azure Container Registry."
  type        = string
}

variable "backend_image_tag" {
  description = "Immutable ACR image tag for the backend Container App."
  type        = string
}

variable "feature_flags_enabled" {
  description = "Deployment-level feature flag configuration for the backend."
  type        = bool
  default     = false
}