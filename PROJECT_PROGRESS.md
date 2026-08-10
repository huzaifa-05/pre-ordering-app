# Project Overview

## Project Name

Cloud-Native Restaurant Pre-Ordering System

## Purpose

This project provisions a production-style AWS foundation for a restaurant pre-ordering application using Terraform, modular infrastructure design, and automated CI/CD. The repository also contains the application layer: a React/Vite frontend, a Node.js/Express backend, MySQL database integration, Cognito-aware authentication middleware, Docker packaging, and deployment build specifications.

## Objectives

- Infrastructure as Code
- Modular Terraform
- AWS Best Practices
- GitOps workflow
- High Availability
- Automation
- Scalability
- Security
- Application deployment readiness

---

# Repository Information

## Repository Name

Pre-Ordering-App

## Current Branch

feature/pre-ordering-system

## Terraform Root Directory

terraform/environments/dev

## Current Deployment Environment

- Environment: `dev`
- AWS Region: `us-west-2`
- GitHub Repository: `awabamjad1/internship-program-2026`
- GitHub Branch: `feature/pre-ordering-system`
- Terraform Backend: S3 remote state

## Current Terraform Structure

```text
terraform/
|-- buildspec-apply.yml
|-- buildspec-plan.yml
|-- environments/
|   `-- dev/
|       |-- backend.tf
|       |-- main.tf
|       |-- outputs.tf
|       |-- providers.tf
|       |-- terraform.tfvars
|       |-- variables.tf
|       `-- versions.tf
`-- modules/
    |-- alb/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- auth/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- compute/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- database/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- ecr/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- frontend_hosting/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- networking/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- pipeline/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    |-- security/
    |   |-- main.tf
    |   |-- outputs.tf
    |   `-- variables.tf
    `-- storage/
        |-- main.tf
        |-- outputs.tf
        `-- variables.tf
```

## Current Application Structure

```text
frontend/
|-- buildspec.yml
|-- index.html
|-- package.json
|-- vite.config.js
`-- src/
    |-- App.jsx
    |-- main.jsx
    |-- index.css
    |-- components/
    |-- pages/
    `-- services/

server/
|-- appspec.yml
|-- buildspec.yml
|-- Dockerfile
|-- package.json
|-- server.js
|-- config/
|-- data/
|-- deployment/
|-- middleware/
`-- scripts/
```

---

# Current Terraform Root Wiring

The dev Terraform root currently instantiates these modules:

- `module.storage`
- `module.pipeline`
- `module.networking`
- `module.security`
- `module.ecr`
- `module.alb`
- `module.compute`
- `module.auth`
- `module.frontend_hosting`

The following module directories exist but are not yet wired into `terraform/environments/dev/main.tf`:

- `database`

---

# Completed Terraform Modules

## Storage

### Purpose

The Storage module creates the foundational S3 resources required for Terraform remote state management and CodePipeline artifact storage.

### AWS Resources Created

- Terraform State Bucket
- Pipeline Artifact Bucket
- Versioning
- Server-side encryption
- Public Access Block
- Ownership Controls
- Remote Backend support

### Terraform Resources

- `data.aws_caller_identity.current`
- `aws_s3_bucket.terraform_state`
- `aws_s3_bucket_versioning.terraform_state`
- `aws_s3_bucket_server_side_encryption_configuration.terraform_state`
- `aws_s3_bucket_public_access_block.terraform_state`
- `aws_s3_bucket_ownership_controls.terraform_state`
- `aws_s3_bucket.pipeline_artifacts`
- `aws_s3_bucket_versioning.pipeline_artifacts`
- `aws_s3_bucket_server_side_encryption_configuration.pipeline_artifacts`
- `aws_s3_bucket_public_access_block.pipeline_artifacts`
- `aws_s3_bucket_ownership_controls.pipeline_artifacts`

### Inputs

- `project_name`

### Outputs

- `terraform_state_bucket_name`
- `terraform_state_bucket_arn`
- `pipeline_artifact_bucket_name`
- `pipeline_artifact_bucket_arn`

### Dependencies

- AWS account identity for globally unique S3 bucket names.

### Current Status

Completed and wired into the dev Terraform root.

---

## Pipeline

### Purpose

The Pipeline module creates the Terraform CI/CD workflow that validates, plans, manually approves, and applies infrastructure changes from GitHub.

### AWS Resources Created

- Existing GitHub CodeConnection reused
- CodePipeline
- CodeBuild project for Terraform Validate and Plan
- CodeBuild project for Terraform Apply
- Manual Approval stage
- IAM Roles
- AdministratorAccess for Terraform CodeBuild

### Terraform Resources

- `data.aws_iam_policy_document.codebuild_assume_role`
- `aws_iam_role.terraform_codebuild`
- `aws_iam_role_policy_attachment.terraform_codebuild_admin`
- `data.aws_iam_policy_document.codepipeline_assume_role`
- `aws_iam_role.codepipeline`
- `data.aws_iam_policy_document.codepipeline`
- `aws_iam_role_policy.codepipeline`
- `aws_codebuild_project.terraform_plan`
- `aws_codebuild_project.terraform_apply`
- `aws_codepipeline.main`

### Inputs

- `project_name`
- `environment`
- `aws_region`
- `github_repository`
- `github_branch`
- `github_connection_arn`
- `artifact_bucket_name`
- `artifact_bucket_arn`
- `state_bucket_arn`

### Outputs

- `pipeline_name`
- `pipeline_arn`
- `terraform_plan_project_name`
- `terraform_apply_project_name`
- `terraform_codebuild_role_arn`
- `codepipeline_role_arn`

### Dependencies

- Storage module artifact bucket.
- Storage module Terraform state bucket.
- Existing authorized GitHub CodeConnection.
- GitHub repository and target branch.

### Pipeline Flow

```text
GitHub

v

Terraform Validate + Plan

v

Manual Approval

v

Terraform Apply
```

### Current Status

Completed and wired into the dev Terraform root.

---

## Networking

### Purpose

The Networking module creates the core AWS network foundation for the application, including public and private subnet tiers across multiple Availability Zones.

### AWS Resources Created

- VPC
- Internet Gateway
- Two Public Subnets
- Two Private Subnets
- Elastic IP
- NAT Gateway
- Public Route Table
- Private Route Table
- Route Table Associations

### Terraform Resources

- `aws_vpc.main`
- `aws_internet_gateway.main`
- `aws_subnet.public`
- `aws_subnet.private`
- `aws_eip.nat`
- `aws_nat_gateway.main`
- `aws_route_table.public`
- `aws_route_table.private`
- `aws_route_table_association.public`
- `aws_route_table_association.private`

### Inputs

- `project_name`
- `environment`
- `vpc_cidr`
- `public_subnet_cidrs`
- `private_subnet_cidrs`
- `availability_zones`

### Outputs

- `vpc_id`
- `public_subnet_ids`
- `private_subnet_ids`
- `internet_gateway_id`
- `nat_gateway_id`
- `public_route_table_id`
- `private_route_table_id`

### Dependencies

- Dev environment CIDR ranges.
- Dev Availability Zones.
- Terraform pipeline for validated deployment.

### Current Status

Completed and wired into the dev Terraform root.

Networking was successfully deployed through the Terraform pipeline after resolving the Elastic IP quota issue. The dev environment intentionally uses one NAT Gateway to optimize cost.

---

## Security

### Purpose

The Security module creates controlled network access between CloudFront, the Application Load Balancer, backend EC2 instances, and the RDS database.

### AWS Resources Created

- ALB Security Group
- EC2 Security Group
- RDS Security Group
- ALB ingress rule allowing HTTP from the AWS-managed CloudFront origin-facing prefix list
- EC2 ingress rule allowing backend traffic from the ALB only
- RDS ingress rule allowing MySQL traffic from EC2 only
- ALB and EC2 outbound rules

### Terraform Resources Created

- `data.aws_ec2_managed_prefix_list.cloudfront`
- `aws_security_group.alb`
- `aws_security_group_rule.alb_ingress_from_cloudfront`
- `aws_security_group_rule.alb_egress`
- `aws_security_group.ec2`
- `aws_security_group_rule.ec2_ingress_from_alb`
- `aws_security_group_rule.ec2_egress`
- `aws_security_group.rds`
- `aws_security_group_rule.rds_ingress_from_ec2`

### Inputs

- `project_name`
- `environment`
- `vpc_id`
- `backend_port`
- `cloudfront_prefix_list_id`

### Outputs

- `alb_security_group_id`
- `ec2_security_group_id`
- `rds_security_group_id`

### Dependencies

- Networking module VPC ID.
- AWS-managed CloudFront origin-facing prefix list.

### Current Status

Completed

---

## ECR

### Purpose

The ECR module creates the private container registry used to store backend Docker images.

### AWS Resources Created

- Amazon ECR repository
- Image scanning on push
- AES256 image encryption
- Lifecycle policy for old untagged images

### Terraform Resources Created

- `aws_ecr_repository.backend`
- `aws_ecr_lifecycle_policy.backend`

### Inputs

- `project_name`
- `environment`
- `untagged_image_count`

### Outputs

- `repository_name`
- `repository_arn`
- `repository_url`

### Dependencies

- Project naming and environment configuration.

### Current Status

Completed

---

## Application Load Balancer

### Purpose

The ALB module exposes the backend API through a public Application Load Balancer and forwards HTTP traffic to the backend target group.

### AWS Resources Created

- Application Load Balancer
- Backend Target Group
- HTTP Listener
- Backend health check configuration

### Terraform Resources Created

- `aws_lb.main`
- `aws_lb_target_group.backend`
- `aws_lb_listener.http`

### Inputs

- `project_name`
- `environment`
- `vpc_id`
- `public_subnet_ids`
- `alb_security_group_id`
- `backend_port`
- `health_check_path`

### Outputs

- `alb_arn`
- `alb_dns_name`
- `target_group_arn`

### Dependencies

- Networking module VPC ID.
- Networking module public subnet IDs.
- Security module ALB security group ID.

### Current Status

Completed

---

## Compute

### Purpose

The Compute module provisions the backend runtime layer using EC2, Auto Scaling, and ECR-based container bootstrap.

### AWS Resources Created

- EC2 IAM Role and Instance Profile
- Launch Template
- Auto Scaling Group
- CPU target tracking scaling policy
- SSM and ECR read-only IAM policy attachments

### Terraform Resources Created

- `data.aws_iam_policy_document.ec2_assume_role`
- `data.aws_region.current`
- `data.aws_ami.amazon_linux`
- `aws_iam_role.ec2`
- `aws_iam_role_policy_attachment.ssm`
- `aws_iam_role_policy_attachment.ecr_read_only`
- `aws_iam_instance_profile.ec2`
- `aws_launch_template.backend`
- `aws_autoscaling_group.backend`
- `aws_autoscaling_policy.cpu_target_tracking`

### Inputs

- `project_name`
- `environment`
- `private_subnet_ids`
- `ec2_security_group_id`
- `target_group_arn`
- `repository_url`
- `backend_port`
- `instance_type`
- `min_size`
- `desired_capacity`
- `max_size`
- `target_cpu_utilization`
- `image_tag`

### Outputs

- `autoscaling_group_name`
- `launch_template_id`
- `ec2_role_arn`

### Dependencies

- Networking private subnet IDs.
- Security module EC2 security group ID.
- ALB target group ARN.
- ECR repository URL.

### Current Status

Completed

---

## Cognito Authentication

### Purpose

The Authentication module provisions Cognito resources compatible with the existing direct Cognito API frontend flow and backend JWT validation.

### AWS Resources Created

- Cognito User Pool
- Cognito User Pool App Client
- Email username and auto verification
- Verified-email account recovery
- Password policy

### Terraform Resources Created

- `aws_cognito_user_pool.main`
- `aws_cognito_user_pool_client.frontend`

### Inputs

- `project_name`
- `environment`

### Outputs

- `user_pool_id`
- `user_pool_arn`
- `user_pool_client_id`

### Dependencies

- Frontend Cognito environment variables.
- Backend Cognito environment variables.

### Current Status

Completed

---

## Frontend Hosting

### Purpose

The Frontend Hosting module provisions private S3 and CloudFront infrastructure for the React single-page application.

### AWS Resources Created

- Private S3 frontend bucket
- S3 versioning, encryption, public access block, and ownership controls
- CloudFront Origin Access Control
- CloudFront distribution
- SPA fallback responses for 403 and 404
- Bucket policy allowing CloudFront-only access

### Terraform Resources Created

- `data.aws_caller_identity.current`
- `data.aws_cloudfront_cache_policy.caching_optimized`
- `aws_s3_bucket.frontend`
- `aws_s3_bucket_versioning.frontend`
- `aws_s3_bucket_server_side_encryption_configuration.frontend`
- `aws_s3_bucket_public_access_block.frontend`
- `aws_s3_bucket_ownership_controls.frontend`
- `aws_cloudfront_origin_access_control.frontend`
- `aws_cloudfront_distribution.frontend`
- `data.aws_iam_policy_document.frontend_bucket`
- `aws_s3_bucket_policy.frontend`

### Inputs

- `project_name`
- `environment`

### Outputs

- `bucket_name`
- `bucket_arn`
- `cloudfront_distribution_id`
- `cloudfront_domain_name`

### Dependencies

- AWS account identity for globally unique S3 bucket naming.
- AWS-managed CloudFront cache policy.

### Current Status

Completed

---

# Pending Terraform Modules

The following modules are not yet marked as completed in this handoff document:

## Database

### Planned Purpose

Create the managed MySQL database layer for menu and order data.

### Planned AWS Resources

- RDS MySQL database
- DB subnet group
- Database configuration and outputs required by the backend

### Current Status

Scaffolded only. Not implemented and not deployed.

---

# Application Layer Status

## Frontend

### Current Implementation

- React application using Vite.
- Tailwind CSS configured through the Vite/Tailwind package.
- Pages for home, menu, and orders.
- Components for navigation, menu cards, cart, order form, and authentication modal.
- API service module under `frontend/src/services/api.js`.

### Deployment Assets

- `frontend/buildspec.yml` builds the frontend and syncs the generated `dist` output to S3.
- The buildspec also invalidates a CloudFront distribution after upload.

### Current Status

Application code and frontend hosting infrastructure exist. The build pipeline will publish the React production build to S3 and invalidate CloudFront.

---

## Backend

### Current Implementation

- Node.js/Express API.
- MySQL integration through `mysql2`.
- Local menu fallback when the database is unavailable.
- Health endpoint.
- Menu endpoint.
- Authenticated order creation endpoint.
- Authenticated order listing endpoint.
- Cognito JWT verification middleware.

### Deployment Assets

- `server/Dockerfile` packages the backend as a container.
- `server/buildspec.yml` builds and pushes a commit-tagged image to ECR.
- `server/appspec.yml` defines CodeDeploy hooks for EC2 deployment.
- `server/deployment/install.sh`, `start.sh`, and `stop.sh` support backend container deployment.

### Current Status

Application code, deployment scripts, ECR, ALB, and compute infrastructure exist. Terraform database infrastructure is not yet implemented in the active dev root.

---

# Current AWS Architecture

```text
GitHub

v

Terraform CodePipeline

v

Terraform Validate + Plan

v

Manual Approval

v

Terraform Apply

v

Storage + Networking + Security + ECR + ALB + Compute + Authentication + Frontend Hosting
```

Current application architecture:

```text
Internet

v

CloudFront + S3 Frontend

v

Application Load Balancer

v

Backend Compute

v

RDS MySQL (pending)
```

---

# Terraform Module Dependency Graph

Current active dependency chain:

```text
Storage

v

Pipeline

v

Networking

v

Security

v

ECR

v

ALB

v

Compute

v

Authentication

v

Frontend Hosting
```

Planned full dependency chain:

```text
Storage

v

Pipeline

v

Networking

v

Security

v

ECR

v

Database

v

Compute

v

ALB

v

Authentication

v

Frontend Hosting
```

---

# Remaining Modules and Milestones

- [x] Security
- [x] ECR
- [ ] Database
- [x] Compute
- [x] Application Load Balancer
- [x] Cognito Authentication
- [x] Frontend Hosting
- [ ] Backend pipeline integration
- [ ] Frontend pipeline integration
- [ ] Final Integration
- [ ] Testing
- [ ] Documentation

---

# Coding Standards

Every Terraform module must follow these standards:

- Modular design
- Reusable variables
- Outputs only when required
- Professional comments
- No hardcoded values
- Environment-aware configuration
- Production naming conventions
- AWS Well-Architected best practices
- Least privilege IAM wherever possible
- Clear dependency boundaries between modules

---

# Deployment Workflow

## Terraform Infrastructure Workflow

All infrastructure changes must follow this workflow:

```text
Developer

v

Git Commit

v

Git Push

v

CodePipeline

v

Terraform Validate

v

Terraform Plan

v

Manual Approval

v

Terraform Apply

v

Infrastructure Updated
```

## Local Terraform Validation Workflow

Local Terraform is for formatting and validation only. Infrastructure planning and deployment must run through CodePipeline because the dev environment uses a shared S3 remote backend.

Recommended local workflow:

```text
cd terraform/environments/dev

terraform init -backend=false

terraform fmt

terraform validate
```

Do not run local Terraform planning for this project. If a local `.terraform` directory was previously initialized against the S3 backend, remove that generated directory or use a fresh Terraform data directory before running `terraform init -backend=false`.

## Backend Application Workflow

The backend deployment assets currently support this planned workflow:

```text
Git Commit

v

CodeBuild

v

Docker Build

v

Push Image to ECR

v

CodeDeploy

v

Run Backend Container on Compute
```

## Frontend Application Workflow

The frontend deployment assets currently support this planned workflow:

```text
Git Commit

v

CodeBuild

v

Vite Production Build

v

Upload dist/ to S3

v

Invalidate CloudFront

v

Frontend Updated
```

---

# Known Decisions

- Single Terraform project.
- Environment-specific root under `terraform/environments/dev`.
- Reusable Terraform modules.
- Existing GitHub CodeConnection reused; do not create another CodeConnection.
- Remote Terraform state stored in S3.
- Terraform executed through CodePipeline after validation and manual approval.
- One NAT Gateway for the dev environment to optimize cost.
- Backend is designed as a Dockerized Node.js/Express service.
- Backend data layer targets MySQL with local fallback data for menu reads.
- Backend authentication middleware is prepared for Cognito access-token verification.
- Frontend is designed as a React/Vite single-page application.
- Frontend deployment is designed for S3 plus CloudFront.

---

# Learning Notes

This project is intentionally being built module by module to strengthen understanding of Terraform and AWS concepts. The goal is to learn each infrastructure layer as it is introduced instead of generating the entire environment at once.

Each completed module should be reviewed, validated, deployed, and documented before moving to the next major milestone. This keeps the project easier to debug and makes the repository suitable as a handoff document for future development.

---

# Next Task

The next Terraform module to implement is Database.

It should create the managed MySQL database layer required by the backend API.

After the Database module is implemented and deployed through the Terraform pipeline, update this `PROJECT_PROGRESS.md` file with:

- Purpose
- AWS resources created
- Terraform resources
- Inputs
- Outputs
- Dependencies
- Current status
- Any deployment notes or issues resolved

All future modules should update `PROJECT_PROGRESS.md` whenever a milestone is completed. This document is the project handoff and should remain professional, accurate, and easy to maintain.

