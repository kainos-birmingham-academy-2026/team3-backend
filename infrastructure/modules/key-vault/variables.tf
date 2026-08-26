variable "name" {
  description = "Globally unique name of the Key Vault."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the Key Vault."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Key Vault."
  type        = string
}

variable "tags" {
  description = "Tags to apply to the Key Vault."
  type        = map(string)
  default     = {}
}