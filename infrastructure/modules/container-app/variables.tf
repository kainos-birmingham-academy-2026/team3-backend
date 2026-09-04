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

variable "managed_identity_client_id" {
  description = "Client ID of the user-assigned managed identity."
  type        = string
}

variable "azure_openai_endpoint" {
  description = "Optional Azure OpenAI endpoint for the job role chatbot."
  type        = string
  default     = null
}

variable "azure_openai_deployment" {
  description = "Optional Azure OpenAI model deployment for the job role chatbot."
  type        = string
  default     = null
}

variable "azure_openai_api_version" {
  description = "Azure OpenAI API version used by the job role chatbot."
  type        = string
  default     = "2025-04-01-preview"
}

variable "registry_server" {
  description = "Login server of the Azure Container Registry."
  type        = string
}

variable "image" {
  description = "Fully qualified tagged container image."
  type        = string
}

variable "revision_suffix" {
  description = "Optional suffix used to create a distinct Container App revision."
  type        = string
  default     = null
}

variable "database_url_secret_id" {
  description = "Versionless Key Vault secret ID for DATABASE_URL."
  type        = string
}

variable "jwt_secret_id" {
  description = "Versionless Key Vault secret ID for JWT_SECRET."
  type        = string
}

variable "enable_swagger_docs" {
  description = "Whether Swagger documentation routes are enabled."
  type        = bool
  default     = false
}

variable "seed_database" {
  description = "Whether to run the idempotent Prisma seed before starting the application."
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags to apply to the Container App."
  type        = map(string)
  default     = {}
}