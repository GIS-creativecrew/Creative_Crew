# DATABASE_URL for PostgreSQL
# This will be used in the GitHub Actions pipeline to replace DATABASE_URL in backend/config/db.config.js
output "database_url" {
  description = "Public IP address of the Cloud SQL instance"
  value       = google_sql_database_instance.postgress.ip_address[0].ip_address
}

output "frontend_url" {
  description = "Canonical frontend URL"
  value       = "https://${google_cloud_run_service.frontend.name}-${data.google_project.current.number}.${var.region}.run.app"
}

output "backend_url" {
  description = "Canonical backend URL"
  value       = "https://${google_cloud_run_service.backend.name}-${data.google_project.current.number}.${var.region}.run.app"
}
