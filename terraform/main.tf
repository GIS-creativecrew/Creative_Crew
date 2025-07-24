provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_project" "current" {
  project_id = var.project_id
}

# ----------------------------
# Artifact Registry
# ----------------------------
resource "google_artifact_registry_repository" "app_repo" {
  location      = var.region
  repository_id = "interview-app"
  description   = "Docker repo for Interview App"
  format        = "DOCKER"
}

# ----------------------------
# Cloud SQL PostgreSQL Instance
# ----------------------------
# PostgreSQL Cloud SQL instance
resource "google_sql_database_instance" "postgress" {
  name                = "interview-db-1"
  region              = var.region
  database_version    = "POSTGRES_15"
  deletion_protection = false

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled = true

      authorized_networks {
        name  = "public"
        value = "0.0.0.0/0"
      }
    }
  }
}

# Create the database
resource "google_sql_database" "db" {
  name     = "interviewdb"
  instance = google_sql_database_instance.postgress.name
}

# Root Postgres DB user
resource "google_sql_user" "root" {
  name     = "postgres"
  password = var.db_password
  instance = google_sql_database_instance.postgress.name
}

# Cloud Run Frontend
resource "google_cloud_run_service" "frontend" {
  name     = "frontend"
  location = var.region

  template {
    spec {
      containers {
        image = var.frontend_image
      }
    }
  }

  traffic {
    percent = 100
  }
}

# Cloud Run Backend
resource "google_cloud_run_service" "backend" {
  name     = "backend"
  location = var.region

  template {
    spec {
      containers {
        image = var.backend_image

        env {
          name  = "DB_HOST"
          value = google_sql_database_instance.postgress.connection_name
        }

        env {
          name  = "DB_USER"
          value = "postgres"
        }

        env {
          name  = "DB_PASSWORD"
          value = var.db_password
        }

        env {
          name  = "DB_NAME"
          value = "interviewdb"
        }

        env {
          name  = "FRONTEND_ORIGIN"
          value = google_cloud_run_service.frontend.status[0].url
        }
      }
    }
  }

  traffic {
    percent = 100
  }

  depends_on = [
    google_sql_database_instance.postgress,
    google_sql_database.db,
    google_sql_user.root,
    google_cloud_run_service.frontend
  ]
}

# Allow unauthenticated access to frontend
resource "google_cloud_run_service_iam_member" "frontend_invoker" {
  location = var.region
  service  = google_cloud_run_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Allow unauthenticated access to backend
resource "google_cloud_run_service_iam_member" "backend_invoker" {
  location = var.region
  service  = google_cloud_run_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
