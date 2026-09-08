variable "name" {
  description = "Name of the Service Bus namespace."
  type        = string
}

variable "location" {
  description = "Azure region in which to create the Service Bus namespace."
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group containing the Service Bus namespace."
  type        = string
}

variable "topic_name" {
  description = "Name of the notification topic."
  type        = string
  default     = "notifications"
}

variable "subscription_name" {
  description = "Name of the email processor subscription."
  type        = string
  default     = "email-processor"
}

variable "tags" {
  description = "Tags to apply to the Service Bus namespace."
  type        = map(string)
  default     = {}
}