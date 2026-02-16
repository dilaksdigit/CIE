# IMPLEMENTATION FROM SCRATCH GUIDE: CIE v2.3.2

This guide provides a step-by-step walkthrough to recreate the CIE v2.3.2 project from a blank environment.

---

## Phase 1: Directory Structure Creation

Execute these commands to establish the project backbone:

```bash
# Create Root and Core Directories
mkdir -p cie-v232/{backend/{php/{public,src,routes,tests},python/src/{vector,ai_audit,brief_generator,erp_sync,jobs,utils}},frontend/src/{components,hooks,services,store,styles,pages},database/{migrations,seeds,schema},docs/{api,architecture,user_guides,deployment},scripts/{setup,maintenance,deployment,testing},infrastructure/{docker,kubernetes,terraform},monitoring/{prometheus,grafana,logs},jobs,cache/vectors,storage/{uploads/{images,erp_files},exports/audit_reports}}

# Create nested subdirectories
mkdir -p cie-v232/backend/php/src/{Controllers,Models,Services,Middleware,Validators/Gates,Enums,Utils,Database}
mkdir -p cie-v232/backend/python/src/ai_audit/engines
mkdir -p cie-v232/backend/python/src/erp_sync/connectors
mkdir -p cie-v232/frontend/src/components/{common,sku,cluster,audit,brief,dashboard,auth}
mkdir -p cie-v232/frontend/src/store/slices
mkdir -p cie-v232/monitoring/grafana/dashboards
```

---

## Phase 2: Core Configuration Files

### 1. Environment Variables
Create `.env.example` with the following template:
```bash
# Use 'cp .env.example .env' after creation
APP_ENV=local
DB_CONNECTION=mysql
DB_HOST=db
DB_DATABASE=cie_v232
# ... (see .env.example for details)
```

### 2. Docker Orchestration
Create `docker-compose.yml`:
```yaml
services:
  db:
    image: mysql:8.0
    # ... configurations
  php-api:
    build: ./infrastructure/docker/Dockerfile.php
    # ...
```

---

## Phase 3: Backend Setup

### PHP Setup (Laravel-style/Custom)
1. **Initialize Composer**:
   ```bash
   cd backend/php
   composer init
   composer require guzzlehttp/guzzle league/fractal vlucas/phpdotenv respect/validation predis/predis monolog/monolog
   ```
2. **Configure Autoloading** (in `composer.json`):
   ```json
   "autoload": {
       "psr-4": { "App\\": "src/" }
   }
   ```
3. **Generate Autoload**:
   ```bash
   composer dump-autoload
   ```

### Python Setup (Worker)
1. **Prepare Virtual Environment**:
   ```bash
   cd backend/python
   python -m venv venv
   source venv/bin/activate  # Or 'venv\Scripts\activate' on Windows
   ```
2. **Install Dependencies**:
   ```bash
   pip install openai anthropic google-generativeai numpy redis requests pandas pymysql flask
   ```

---

## Phase 4: Frontend Setup

1. **Initialize React with Vite**:
   ```bash
   cd frontend
   npm create vite@latest . -- --template react
   ```
2. **Install Feature Dependencies**:
   ```bash
   npm install axios zustand react-router-dom react-hook-form react-dropzone recharts date-fns clsx
   ```

---

## Phase 5: Database Initialization

1. **Run Migrations**:
   Execute files in `database/migrations/` sequentially.
   ```bash
   # Using the provided Makefile
   make migrate
   ```
2. **Seed Data**:
   ```bash
   make seed
   ```

---

## Phase 6: Orchestration and Launch

1. **Build and Start Containers**:
   ```bash
   docker-compose up -d --build
   ```
2. **Verify Services**:
   - PHP API: `http://localhost:8000`
   - Python Worker: `http://localhost:5000`
   - Frontend: `http://localhost:3000`

---

## Summary of Commands (Quick Rebuild)

```bash
# Clone or Copy Files
# Initialize ENV
cp .env.example .env

# Install All Dependencies
make install-all

# Start Services
docker-compose up -d

# Initialize Database
./scripts/setup/init_database.sh
./scripts/setup/seed_dev_data.sh
```
