# DB subnet group uses private application subnets
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name        = "${var.project_name}-${var.environment}-db-subnet-group"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Aurora MySQL cluster with managed credentials
resource "aws_rds_cluster" "main" {
  cluster_identifier = "${var.project_name}-${var.environment}-aurora"

  engine         = "aurora-mysql"
  engine_version = var.engine_version

  database_name   = var.database_name
  master_username = var.db_master_username

  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.rds_security_group_id]

  storage_encrypted       = true
  backup_retention_period = var.backup_retention_period
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : (
    "${var.project_name}-${var.environment}-aurora-final-snapshot"
  )

  tags = {
    Name        = "${var.project_name}-${var.environment}-aurora"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Writer DB instance
resource "aws_rds_cluster_instance" "writer" {
  identifier         = "${var.project_name}-${var.environment}-aurora-writer"
  cluster_identifier = aws_rds_cluster.main.id

  engine         = aws_rds_cluster.main.engine
  instance_class = var.db_instance_class

  db_subnet_group_name = aws_db_subnet_group.main.name
  publicly_accessible  = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-aurora-writer"
    Project     = var.project_name
    Environment = var.environment
  }
}

# Reader DB instance
resource "aws_rds_cluster_instance" "reader" {
  identifier         = "${var.project_name}-${var.environment}-aurora-reader"
  cluster_identifier = aws_rds_cluster.main.id

  engine         = aws_rds_cluster.main.engine
  instance_class = var.db_instance_class

  db_subnet_group_name = aws_db_subnet_group.main.name
  publicly_accessible  = false

  tags = {
    Name        = "${var.project_name}-${var.environment}-aurora-reader"
    Project     = var.project_name
    Environment = var.environment
  }
}
