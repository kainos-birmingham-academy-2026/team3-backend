variable "name" {
  description = "Name of the Container App Environment."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the Container App Environment."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Container App Environment."
  type        = string
}

variable "tags" {
  description = "Tags to apply to the Container App Environment."
  type        = map(string)
  default     = {}
}