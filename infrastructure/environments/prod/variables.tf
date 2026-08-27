variable "project_name" {
  description = "Short project name used in Azure resource names."
  type        = string
}

variable "environment" {
  description = "Deployment environment."
  type        = string

  validation {
    condition     = var.environment == "prod"
    error_message = "The production root requires environment to be prod."
  }
}

variable "location" {
  description = "Azure region in which to create resources."
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

  validation {
    condition     = !contains(["latest", "dev-latest"], lower(var.backend_image_tag))
    error_message = "Production requires an immutable image tag, such as a commit SHA or release version."
  }
}

variable "enable_swagger_docs" {
  description = "Whether Swagger documentation routes are enabled in the backend."
  type        = bool
  default     = false
}