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
  description = "ACR image tag for the backend Container App."
  type        = string
  default     = "dev-latest"
}

variable "container_revision_suffix" {
  description = "Optional unique suffix that forces a new Container App revision."
  type        = string
  default     = null
}

variable "enable_swagger_docs" {
  description = "Whether Swagger documentation routes are enabled in the backend."
  type        = bool
  default     = false
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