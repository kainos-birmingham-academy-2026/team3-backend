variable "project_name" {
  description = "Short project name used in Azure resource names."
  type        = string
}

variable "environment" {
  description = "Environment selecting a unique reserved network address space."
  type        = string

  validation {
    condition     = contains(["dev", "test1", "test2", "test3", "uat", "prod"], var.environment)
    error_message = "The environment must have a reserved address space: dev, test1, test2, test3, uat or prod."
  }
}

variable "location" {
  description = "Azure region in which to create the network."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the existing environment resource group."
  type        = string
}

variable "tags" {
  description = "Tags applied to the virtual network."
  type        = map(string)
  default     = {}
}