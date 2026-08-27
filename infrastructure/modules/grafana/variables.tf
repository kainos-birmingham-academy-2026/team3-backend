variable "name" {
  description = "Name of the Azure Managed Grafana instance."
  type        = string

  validation {
    condition     = length(var.name) >= 2 && length(var.name) <= 23
    error_message = "Grafana instance names must be between 2 and 23 characters."
  }
}

variable "location" {
  description = "Azure region in which to create the Grafana instance."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Grafana instance."
  type        = string
}

variable "grafana_major_version" {
  description = "Major version of Grafana to deploy."
  type        = string
  default     = "11"
}

variable "monitoring_reader_scope" {
  description = "Scope at which Grafana is granted Monitoring Reader, typically the resource group ID."
  type        = string
}

variable "admin_object_ids" {
  description = "Entra ID object IDs granted the Grafana Admin role on the instance."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to the Grafana instance."
  type        = map(string)
  default     = {}
}
