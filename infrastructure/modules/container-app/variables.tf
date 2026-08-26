variable "name" {
  description = "Name of the Container App."
  type        = string
}

variable "container_app_environment_id" {
  description = "Resource ID of the Container App Environment."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Container App."
  type        = string
}

variable "managed_identity_id" {
  description = "Resource ID of the user-assigned managed identity."
  type        = string
}

variable "registry_server" {
  description = "Login server of the Azure Container Registry."
  type        = string
}

variable "image" {
  description = "Fully qualified container image including its immutable tag."
  type        = string
}

variable "database_url_secret_id" {
  description = "Versionless Key Vault secret ID for DATABASE_URL."
  type        = string
}

variable "jwt_secret_id" {
  description = "Versionless Key Vault secret ID for JWT_SECRET."
  type        = string
}

variable "feature_flags_enabled" {
  description = "Deployment-level feature flag configuration."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to the Container App."
  type        = map(string)
  default     = {}
}