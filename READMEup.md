# CIE — README

Project root: C:\Dilaksan\CIE\CIE

This README provides a concise, end-to-end guide: setup, local development, testing, and deployment.

Prerequisites
- Git
- Docker & Docker Compose
- Node.js (14+), npm/Yarn
- PHP (8+), Composer (if running PHP services locally)
- Python 3.8+, virtualenv
- kubectl (for k8s), terraform (for infra), helm (optional)
- A POSIX shell recommended on Windows (WSL, Git Bash, PowerShell with appropriate tooling)

Quick Start (recommended: Docker Compose)
1. Clone
   git clone <repo-url> C:\Dilaksan\CIE\CIE
   cd C:\Dilaksan\CIE\CIE

2. Environment
   - Copy env: cp .env.example .env (or copy manually on Windows)
   - Edit .env to set DB credentials, Redis, API keys, and other secrets.

3. Build & run
   docker-compose up --build -d
   - Services are defined in docker-compose.yml
   - To view logs: docker-compose logs -f

Database: migrations & seeds
- The database folder contains SQL migrations and seed files.
- Run migrations/seeds against the running DB container:
  docker-compose exec <db_service_name> bash
  # inside container (example for psql)
  psql -U $DB_USER -d $DB_NAME -f /path/to/database/migrations/001_create_users_table.sql
- Alternatively, import all migrations:
  for f in database/migrations/*.sql; do psql -U $DB_USER -d $DB_NAME -f "$f"; done
- Seeds: run database/seeds/*.sql similarly.

Backend — PHP service
- Location: backend/php
- Local dev:
  cd backend/php
  composer install
  cp .env.example .env
  php -S localhost:8000 -t public (or use built-in server or valet)
- Docker: Dockerfile.php is provided; docker-compose builds and runs service.

Backend — Python service
- Location: backend/python
- Local dev:
  cd backend/python
  python -m venv .venv
  .venv\Scripts\activate (Windows) or source .venv/bin/activate (Unix)
  pip install -r requirements.txt
  export FLASK_ENV=development (or set env)
  python -m src.app (or follow src README)
- Docker: Dockerfile.python is provided; docker-compose builds and runs service.

Frontend
- Location: frontend
- Install & run:
  cd frontend
  npm install
  npm run dev        # local dev server
  npm run build      # production build -> public/assets or configured output
- The built frontend assets are served from frontend/public or integrated into the PHP public folder in Docker/K8s.

Running Tests
- Unit/integration tests live in tests/
- PHP: run composer scripts or phpunit if configured.
- Python: pytest inside backend/python
- Frontend: npm test
- Example:
  cd backend/python
  .venv\Scripts\activate
  pytest -q

CI / Linting
- Follow repo's lint/test scripts (check package.json and composer.json).
- Add pre-commit hooks as needed.

Deployment

A. Docker Compose (simple)
1. Ensure .env is production-ready.
2. Build and push images (if using remote registry):
   docker-compose build
   docker tag <image> <registry>/<repo>:<tag>
   docker push <registry>/<repo>:<tag>
3. On production host:
   docker-compose pull
   docker-compose up -d --remove-orphans

B. Kubernetes (recommended for scale)
- Manifests: infrastructure/kubernetes/*.yaml
- Create namespace/secret/config:
  kubectl apply -f infrastructure/kubernetes/configmap.yaml
  kubectl apply -f infrastructure/kubernetes/service.yaml
  kubectl apply -f infrastructure/kubernetes/deployment.yaml
  kubectl apply -f infrastructure/kubernetes/ingress.yaml
- Update image tags in deployment.yaml for each service, then:
  kubectl rollout restart deployment/<deployment-name>

C. Terraform (infrastructure provisioning)
- Location: infrastructure/terraform
- Usage:
  cd infrastructure/terraform
  terraform init
  terraform plan -out plan.tfplan
  terraform apply plan.tfplan
- Terraform handles cloud resources (VPC, k8s cluster, managed DB) per variables.tf.

D. Deployment scripts
- scripts/deployment contains deploy_production.sh, deploy_staging.sh, rollback.sh
- Use these to orchestrate CI/CD flows. Ensure they are executable and environment variables/secrets are set.

Monitoring & Logs
- Monitoring stacks (Prometheus, Grafana) are under monitoring/
- Logs aggregated under logs/ and via Docker logs or centralized logging (ELK/Fluentd) as configured.

Maintenance tasks
- scripts/maintenance contains backup_database.sh, clear_cache.sh, restore_database.sh
- Cron jobs / scheduled jobs exist under jobs/ (daily_backup.sh, hourly_vector_retry.sh, etc.). Wire them into your scheduler system (cron, Kubernetes CronJob).

Best practices & notes
- Keep secrets out of repository; use environment variables, vault, or secrets manager.
- Back up DB regularly; test restores.
- Use CI (GitHub Actions / GitLab CI) to run tests, linters, and build images.
- When updating schema: add new migration SQL into database/migrations and run in order.

Troubleshooting
- Check container logs: docker-compose logs -f <service>
- DB connection issues: verify .env DB_HOST and credentials, and network accessibility.
- Permission issues on Windows: use WSL for posix behavior when using scripts and docker volumes.

Useful Commands Summary
- Start dev (Docker): docker-compose up --build -d
- Stop: docker-compose down
- Rebuild a service: docker-compose up -d --build <service>
- Exec into service: docker-compose exec <service> bash
- Apply k8s manifests: kubectl apply -f infrastructure/kubernetes/
- Terraform: cd infrastructure/terraform && terraform init && terraform apply

Contact / Documentation
- API docs: docs/api/openapi.yaml and postman_collection.json
- Architecture and runbooks: docs/architecture/* and docs/deployment/*

This README is a concise operational guide. Inspect the Makefile, scripts/, and docs/ for project-specific commands and environment values.