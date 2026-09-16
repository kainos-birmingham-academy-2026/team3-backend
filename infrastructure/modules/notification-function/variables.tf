variable "name" {
  description = "Name of the notification Function App."
  type        = string
}

variable "storage_account_name" {
  description = "Globally unique storage account name for Function runtime and deployment storage."
  type        = string
}

variable "deployment_container_name" {
  description = "Name of the blob container used for Function deployment packages."
  type        = string
  default     = null
}

variable "service_plan_name" {
  description = "Name of the Flex Consumption service plan."
  type        = string
}

variable "application_insights_name" {
  description = "Name of the Function App Application Insights component."
  type        = string
}

variable "location" {
  description = "Azure region in which to create Function resources."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing Function resources."
  type        = string
}

variable "log_analytics_workspace_id" {
  description = "Resource ID of the Log Analytics workspace backing Application Insights."
  type        = string
  default     = null
}

variable "service_bus_connection_secret_uri" {
  description = "Versionless Key Vault secret URI for the Function's Listen-only Service Bus connection."
  type        = string
}

variable "acs_connection_secret_uri" {
  description = "Versionless Key Vault secret URI for the Azure Communication Services connection."
  type        = string
}

variable "email_sender_address" {
  description = "Verified Azure Communication Services sender address."
  type        = string
}

variable "service_bus_setting_name" {
  description = "Function app setting named by the Service Bus trigger connection property."
  type        = string
  default     = "rgteam3svb_SERVICEBUS"
}

variable "tags" {
  description = "Tags to apply to Function resources."
  type        = map(string)
  default     = {}
}