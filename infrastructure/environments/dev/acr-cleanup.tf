resource "azurerm_container_registry_task" "image_cleanup" {
  name                  = "purge-team3-images"
  container_registry_id = data.azurerm_container_registry.shared.id
  enabled               = true
  timeout_in_seconds    = 3600

  platform {
    os           = "Linux"
    architecture = "amd64"
  }

  encoded_step {
    task_content = base64encode(<<-YAML
      version: v1.1.0
      steps:
        - cmd: >-
            acr purge
            --filter 'team3-backend:^dev-[0-9a-f]{40}$'
            --filter 'team3-frontend:^dev-[0-9a-f]{40}$'
            --ago 2d
            --keep 1
        - cmd: >-
            acr purge
            --filter 'team3-backend:^test-[0-9a-f]{40}$'
            --filter 'team3-frontend:^test-[0-9a-f]{40}$'
            --ago 1d
            --keep 1
    YAML
    )
  }

  timer_trigger {
    name     = "daily-image-cleanup"
    schedule = "0 1 * * *"
    enabled  = true
  }

  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}