variable "name" {
  description = "Name of the PostgreSQL Flexible Server."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing PostgreSQL."
  type        = string
}

variable "location" {
  description = "Azure region in which to create PostgreSQL."
  type        = string
}

variable "postgresql_version" {
  description = "Major PostgreSQL version."
  type        = string
}

variable "administrator_login" {
  description = "PostgreSQL administrator login name."
  type        = string
}

variable "administrator_password" {
  description = "PostgreSQL administrator password."
  type        = string
  sensitive   = true
}

variable "administrator_password_version" {
  description = "Version incremented whenever the PostgreSQL administrator password is rotated."
  type        = number
}

variable "sku_name" {
  description = "PostgreSQL compute SKU."
  type        = string
}

variable "storage_mb" {
  description = "PostgreSQL storage capacity in MiB."
  type        = number
}

variable "backup_retention_days" {
  description = "Number of days to retain PostgreSQL backups."
  type        = number
}

variable "zone" {
  description = "Availability zone for PostgreSQL."
  type        = string
}

variable "database_name" {
  description = "Name of the application database."
  type        = string
}

variable "tags" {
  description = "Tags applied to PostgreSQL."
  type        = map(string)
  default     = {}
}