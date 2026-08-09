project_name = "pre-ordering-system"
environment  = "dev"
aws_region   = "us-west-2"

github_repository = "awabamjad1/internship-program-2026"
github_branch     = "feature/pre-ordering-system"

github_connection_arn = "arn:aws:codeconnections:us-west-2:395063533284:connection/a69b0212-a1c5-4916-bf71-0df4812ccc96"

vpc_cidr = "10.0.0.0/16"

public_subnet_cidrs = [
  "10.0.1.0/24",
  "10.0.2.0/24"
]

private_subnet_cidrs = [
  "10.0.11.0/24",
  "10.0.12.0/24"
]

availability_zones = [
  "us-west-2a",
  "us-west-2b"
]

# Backend application port
backend_port = 5000

# Compute configuration
instance_type          = "t2.micro"
min_size               = 1
desired_capacity       = 1
max_size               = 3
target_cpu_utilization = 70
image_tag              = "v1"

# Database configuration
database_name              = "preorderingdb"
db_master_username         = "dbadmin"
db_instance_class          = "db.t4g.medium"
db_engine_version          = null
db_backup_retention_period = 3
db_deletion_protection     = false
db_skip_final_snapshot     = true
