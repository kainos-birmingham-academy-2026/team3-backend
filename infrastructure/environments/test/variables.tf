variable "project_name" {
  description = "Short project name used in Azure resource names."
  type        = string
  default     = "team3"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "test"

  validation {
    condition     = var.environment == "test"
    error_message = "The test root requires environment to be test."
  }
}

variable "location" {
  description = "Azure region in which to create resources."
  type        = string
  default     = "uksouth"
}

variable "deployment_principal_object_id" {
  description = "Object ID of the service principal that writes Terraform-managed Key Vault secrets."
  type        = string
}

variable "postgresql_administrator_password_version" {
  description = "Version incremented whenever the test PostgreSQL administrator password is rotated."
  type        = number
  default     = 1
}

variable "application_secret_version" {
  description = "Version incremented to rotate the generated JWT and session secrets."
  type        = number
  default     = 1
}

variable "acr_name" {
  description = "Name of the existing shared Azure Container Registry."
  type        = string
  default     = "acraiacademy26"
}

variable "acr_resource_group_name" {
  description = "Name of the resource group containing the shared Azure Container Registry."
  type        = string
  default     = "rg-ai-academy-26"
}

variable "backend_image_tag" {
  description = "Immutable ACR image tag for the backend Container App."
  type        = string
}

variable "container_revision_suffix" {
  description = "Optional unique suffix that forces a new Container App revision."
  type        = string
  default     = null
}

variable "enable_swagger_docs" {
  description = "Whether Swagger documentation routes are enabled in the backend."
  type        = bool
  default     = true
}

variable "log_retention_in_days" {
  description = "Number of days to retain container logs in Log Analytics."
  type        = number
  default     = 30
}

variable "grafana_admin_object_ids" {
  description = "Entra ID object IDs granted the Grafana Admin role on the dashboard."
  type        = list(string)
  default     = []
}
