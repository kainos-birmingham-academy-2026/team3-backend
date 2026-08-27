variable "name" {
  description = "Name of the Log Analytics workspace."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the Log Analytics workspace."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Log Analytics workspace."
  type        = string
}

variable "retention_in_days" {
  description = "Number of days to retain ingested logs."
  type        = number
  default     = 30

  validation {
    condition     = var.retention_in_days >= 30 && var.retention_in_days <= 730
    error_message = "Retention must be between 30 and 730 days."
  }
}

variable "tags" {
  description = "Tags to apply to the Log Analytics workspace."
  type        = map(string)
  default     = {}
}
