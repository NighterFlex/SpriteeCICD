# Spritee - Group 9 CI/CD Project

Group 9's cloud computing semester project: build a CI/CD pipeline for the Spritee pixel-art website and deploy it to an AWS ECS staging environment.

Team: Imama Zubair (124), Zain (157), Haleema Yasir (158).

## Run and test locally

The website is static HTML, CSS, and JavaScript. Node.js is only needed for the automated JavaScript tests.

```powershell
npm ci
npm test
python -m unittest discover -s tests -v
```

To preview the site without Docker:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000`. Stop the server with Ctrl+C.

To build and run the container, start Docker Desktop first:

```powershell
docker build --build-arg BUILD_COMMIT=local -t spritee:local .
docker run --rm -p 8080:80 spritee:local
```

Open `http://localhost:8080`; the homepage footer should show `Build: local`.

## Project documents

- [Architecture blueprint](ARCHITECTURE.md)
- [Project report and AWS setup checklist](PROJECT_REPORT.md)

The AWS infrastructure and live deployment are not created by these local commands. Follow the project report and coordinate resource names, region, permissions, and budget with the group before provisioning AWS resources.

## Working as a team

1. Clone the shared GitHub repository and create a branch for each task.
2. Make changes on your branch, run the tests above, and push the branch.
3. Open a pull request to `main` so teammates can review it and GitHub Actions can run.
4. Merge after review and passing checks. A push to `main` is intended to trigger the AWS deployment pipeline once it has been configured.

Use GitHub issues or the project discussion to assign work and agree on AWS resource names. Never commit AWS access keys, passwords, private keys, `.env` files, or Terraform state files. Provide AWS permissions through IAM roles and share setup guidance—not credentials—with teammates.
