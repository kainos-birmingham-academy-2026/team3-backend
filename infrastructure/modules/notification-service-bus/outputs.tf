output "namespace_id" {
  description = "Resource ID of the Service Bus namespace."
  value       = azurerm_servicebus_namespace.this.id
}

output "topic_name" {
  description = "Name of the notification topic."
  value       = azurerm_servicebus_topic.notifications.name
}

output "subscription_name" {
  description = "Name of the email processor subscription."
  value       = azurerm_servicebus_subscription.email_processor.name
}

output "backend_send_primary_connection_string" {
  description = "Send-only Service Bus connection string for the backend."
  value       = azurerm_servicebus_namespace_authorization_rule.backend_send.primary_connection_string
  sensitive   = true
}

output "function_listen_primary_connection_string" {
  description = "Listen-only Service Bus connection string for the Function App."
  value       = azurerm_servicebus_namespace_authorization_rule.function_listen.primary_connection_string
  sensitive   = true
}