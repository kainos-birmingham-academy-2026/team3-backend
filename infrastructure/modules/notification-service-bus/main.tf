resource "azurerm_servicebus_namespace" "this" {
  name                = var.name
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "Standard"
  minimum_tls_version = "1.2"

  tags = var.tags
}

resource "azurerm_servicebus_topic" "notifications" {
  name         = var.topic_name
  namespace_id = azurerm_servicebus_namespace.this.id
}

resource "azurerm_servicebus_subscription" "email_processor" {
  name               = var.subscription_name
  topic_id           = azurerm_servicebus_topic.notifications.id
  max_delivery_count = 10

  dead_lettering_on_message_expiration = true
}

resource "azurerm_servicebus_namespace_authorization_rule" "backend_send" {
  name         = "backend-send"
  namespace_id = azurerm_servicebus_namespace.this.id
  listen       = false
  send         = true
  manage       = false
}

resource "azurerm_servicebus_namespace_authorization_rule" "function_listen" {
  name         = "function-listen"
  namespace_id = azurerm_servicebus_namespace.this.id
  listen       = true
  send         = false
  manage       = false
}