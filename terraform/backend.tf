terraform {
  backend "gcs" {
    bucket  = "interview-application-bucket-1"  # replace
    prefix  = "ims-app"
  }
}
