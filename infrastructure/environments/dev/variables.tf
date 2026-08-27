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

variable "enable_swagger_docs" {
  description = "Whether Swagger documentation routes are enabled in the backend."
  type        = bool
  default     = false
}

variable "backend_allowed_ip_ranges" {
  description = "Named CIDR ranges allowed to access the dev backend externally. An empty map keeps ingress internal."
  type        = map(string)
  default = {
    academy-network = "147.161.237.0/24"
  }
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