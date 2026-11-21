# Group 9 Cloud Computing Project

## Project

**Automated CI/CD Pipeline for Cloud Deployments**  
**Application:** Spritee pixel-art website  
**Team:** Imama Zubair (124), Zain (157), Haleema Yasir (158)  
**Target:** AWS ECS staging deployment

## Why Spritee?

Spritee is an existing, lightweight static website in this repository. Using it keeps the project focused on the assigned cloud engineering work: every change to the app can be tested, packaged into a Docker image, and deployed to a staging service automatically.

## What this implementation does

1. GitHub Actions runs on pull requests and pushes to `main`. It tests drawing interactions, checks local HTML/CSS asset references, and verifies that the Docker image builds.
2. An AWS CodePipeline GitHub connection watches the repository's `main` branch.
3. CodeBuild runs the same site tests, builds the Nginx container, tags it with the source commit, pushes it to Amazon ECR, and emits `imagedefinitions.json`.
4. The CodePipeline ECS deploy action uses that artifact to update the staging ECS service.
5. The homepage displays the deployed commit's short ID, making it easier to verify which version reached staging.

GitHub Actions is the fast source-control check; CodePipeline is the AWS deployment pipeline. The CodeBuild project runs tests again so the deployment path independently validates its source.

## Architecture

The Phase 1 architecture blueprint, network/security boundaries, database decision, and cloud setup decisions are documented in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Repository implementation

- `Dockerfile`: packages the static pages and assets in Nginx; embeds the image's commit ID in the homepage.
- `tests/test_site.py`: checks that local HTML and CSS references resolve to files in the repository.
- `tests/test_drawer.test.js`: exercises grid creation, pen/eraser drawing, drag drawing, reset, resizing, and PNG export in a simulated DOM.
- `package.json` and `package-lock.json`: pin the JavaScript test command and `jsdom` dependency used by those interaction tests.
- `.github/workflows/ci.yml`: runs interaction/static tests and a Docker build for PRs and `main`.
- `buildspec.yml`: runs CodeBuild interaction/static tests, pushes the commit-tagged image to ECR, and creates the ECS deployment artifact.

## AWS setup checklist

Create these AWS resources in the same region:

1. **ECR repository** named `spritee`.
2. **ECS cluster and staging service**, with an ECS task definition whose container name is exactly `spritee`, container port is `80`, and image is in the ECR repository. Make the service reachable (for example, through an Application Load Balancer) for the demo.
3. **CodeBuild project** using this repository's `buildspec.yml`, a Linux standard image that supports Python 3.12, and **privileged mode enabled** for Docker builds. Set environment variables `AWS_ACCOUNT_ID` and `IMAGE_REPO_NAME=spritee`; set the project's region to the ECR/ECS region.
4. Give the CodeBuild role permission to write images to the `spritee` ECR repository. The CodePipeline role needs permission to start CodeBuild and deploy the task definition to the ECS service.
5. **CodePipeline** with a GitHub connection source tracking `main`, the CodeBuild project as its build action, and an ECS deploy action configured with the cluster, service, and `imagedefinitions.json` artifact.
6. Protect `main` with the GitHub Actions check required before merge. Direct pushes still trigger the AWS pipeline, so use pull requests for the normal demonstration.

Use narrowly scoped IAM permissions for the actual account. Do not put AWS credentials in this repository or in the GitHub workflow; the AWS CodePipeline/CodeBuild roles perform deployment.

## Local validation

Requirements: Python 3.12+, Node.js 22+, npm, and Docker.

```powershell
python -m unittest discover -s tests -v
npm ci
npm test
docker build --build-arg BUILD_COMMIT=local -t spritee:local .
docker run --rm -p 8080:80 spritee:local
```

The Node.js interaction tests use jsdom to exercise the drawing page's DOM event behavior; they do not launch a full browser. Open `http://localhost:8080` and confirm the footer shows `Build: local`.

## AWS validation and demonstration evidence

After AWS setup and a push to `main`:

```powershell
aws codepipeline get-pipeline-state --name SpriteePipeline
aws codebuild list-builds-for-project --project-name SpriteeBuild --sort-order DESCENDING
aws ecs describe-services --cluster SpriteeCluster --services SpriteeStagingService
```

Capture:

- GitHub Actions passing on the pull request.
- CodePipeline Source, Build, and Deploy stages all green.
- ECS service showing healthy/running tasks.
- The staging website loading and displaying the pushed commit's short ID.

Actual AWS resource creation and screenshots are not included in the repository configuration; complete the checklist using your group's AWS account.
