terraform {
  backend "s3" {
    bucket       = "pre-ordering-system-tfstate-395063533284"
    key          = "bootstrap/terraform.tfstate"
    region       = "us-west-2"
    profile      = "huzaifa-terraform"
    encrypt      = true
    use_lockfile = true
  }
}