module "resource_group" {
  source = "../../modules/resource-group"

  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location
  tags = {
    environment = var.environment
    managed_by  = "terraform"
    project     = var.project_name
  }
}