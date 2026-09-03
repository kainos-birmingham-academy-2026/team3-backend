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

variable "deployment_principal_object_id" {
  description = "Object ID of the service principal that writes Terraform-managed Key Vault secrets."
  type        = string
}

variable "postgresql_administrator_password" {
  description = "Administrator password for the dev PostgreSQL Flexible Server."
  type        = string
  sensitive   = true

  validation {
    condition = (
      length(var.postgresql_administrator_password) >= 8 &&
      length(var.postgresql_administrator_password) <= 128 &&
      sum([
        for pattern in ["[A-Z]", "[a-z]", "[0-9]", "[^A-Za-z0-9]"] :
        can(regex(pattern, var.postgresql_administrator_password)) ? 1 : 0
      ]) >= 3
    )
    error_message = "The PostgreSQL administrator password must be 8-128 characters and contain characters from at least three of: uppercase, lowercase, numbers, and special characters."
  }
}

variable "postgresql_administrator_password_version" {
  description = "Version incremented whenever the dev PostgreSQL administrator password is rotated."
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