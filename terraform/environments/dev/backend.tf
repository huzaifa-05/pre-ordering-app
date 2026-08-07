terraform {
  backend "s3" {
    bucket       = "pre-ordering-system-tfstate-395063533284"
    key          = "environments/dev/terraform.tfstate"
    region       = "us-west-2"
    encrypt      = true
    use_lockfile = true
  }
}
