# Spritee deployment runbook

This runbook provisions the AWS staging stack defined in `terraform/`. Provisioning can incur AWS charges. Review your account, region, and budget before applying. Never commit credentials, `terraform.tfvars`, or Terraform state.

The default `low_cost_mode = true` omits NAT and the load balancer, and starts zero ECS tasks. The service can be reached directly only after setting `desired_count` above zero and allowing an appropriate `allowed_cidr`. For the full pipeline/deployment demonstration with an ALB, set `low_cost_mode = false` and review the expected AWS charges before applying.

## Provision the stack

1. Install Terraform 1.5 or newer and configure AWS credentials locally using your normal AWS CLI profile or IAM Identity Center. Do not put credentials in this repository.
2. From the repository root, copy `terraform/terraform.tfvars.example` to `terraform/terraform.tfvars` if you need to override the defaults. This local file is git-ignored.
3. Initialize, review the plan, and apply:

   ```powershell
   cd terraform
   terraform init
   terraform plan
   terraform apply
   ```

   Confirm the plan is for the intended AWS account and region before approving `apply`. The initial task uses a public Nginx placeholder image; the first successful pipeline deployment replaces it with the Spritee image.
4. Record the `github_connection_arn` output. In the AWS Console, open Developer Tools > Settings > Connections, select the newly created GitHub connection, and choose **Update pending connection** to authorize the GitHub App. This authorization is a one-time console step for the connection.

The private subnets use NAT for outbound access by default. If you set `enable_nat_gateway = false`, configure appropriate VPC endpoints for ECR image pulls and CloudWatch Logs before expecting ECS tasks to start; the tasks do not receive public IPs.

## Run and verify the pipeline

Push or merge a change to `main` in `NighterFlex/SpriteeCICD`. Open CodePipeline and run `WebAppPipeline` if it did not start automatically. Confirm Source and Build pass, then confirm ECS Deploy completes and the service stabilizes.

With `low_cost_mode = false`, use the `alb_dns_name` output to visit the site. In low-cost mode the ALB output is null; if tasks are enabled, connect to a task's public IP instead. Check the `SpriteeStagingService` service in `SpriteeCluster`, target health when using the ALB, and the CloudWatch log group `/ecs/spritee`.

## Demonstrate deployment rollback

Use a temporary branch and a controlled, reversible bad release for the staging demonstration. For example, in a temporary `buildspec.yml` change, leave the Docker build and push intact but change the image URI written to `imagedefinitions.json` to a deliberately nonexistent ECR tag. Merge that change to `main`; the build should pass while the ECS task fails to pull its image, allowing the deployment circuit breaker to roll back to the last healthy deployment. Capture the failed deployment and restored service state, then revert the temporary change through a normal reviewed commit and verify a clean pipeline run. Do not deliberately break a production service or leave the bad release in the default branch.

## Run a Locust load test

Install Locust locally with `python -m pip install locust`, then use a separate terminal from the repository root:

```powershell
locust -f loadtest/locustfile.py --host http://<alb_dns_name>
```

Open `http://localhost:8089`, choose a modest user count and spawn rate suitable for the staging account, and start the test. Stop it after collecting results. When an ACM certificate and HTTPS listener are configured, use `https://<alb_dns_name>` only if the certificate is valid for the hostname being tested; otherwise use HTTP.

## Evidence to capture

- Terraform plan/apply completion and resource outputs (redact account-specific or sensitive details before sharing).
- The GitHub connection showing **Available** after console authorization.
- CodePipeline Source, Build, and Deploy stages succeeding for a commit.
- The bad deployment failure/circuit-breaker rollback and the service returning to healthy tasks.
- The staging website and ECS target health.
- Locust request counts, response-time statistics, and CloudWatch CPU/ALB alarms or metrics.

## Tear down

After the demonstration and evidence capture, destroy the resources to avoid ongoing costs:

```powershell
cd terraform
terraform destroy
```

Review the destroy plan and confirm before proceeding. The artifact and optional CloudTrail buckets are configured for forced deletion, so their contents will also be removed.
