variable "communication_service_name" {
  description = "Name of the Azure Communication Service."
  type        = string
}

variable "email_service_name" {
  description = "Name of the Email Communication Service."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the communication resources."
  type        = string
}

variable "data_location" {
  description = "Data residency location for communication resources."
  type        = string
  default     = "UK"
}

variable "tags" {
  description = "Tags to apply to communication resources."
  type        = map(string)
  default     = {}
}