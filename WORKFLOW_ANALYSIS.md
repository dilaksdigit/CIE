# CIE v2.3.2 Workflow Analysis & Connection Report

**Date**: February 16, 2026  
**Status**: CRITICAL ISSUES FOUND - Multiple missing connections

---

## 1. ARCHITECTURE OVERVIEW

### Components
- **Frontend**: React 18 (Port 8080 via Nginx)
- **Backend (PHP)**: Laravel-style API (Port 9000)
- **Backend (Python)**: Flask REST API (Port 5000)
- **Database**: MySQL 8.0 (Port 3306)
- **Cache**: Redis 7.0 (Port 6379)

### Current Network Wiring
```
Frontend (http://localhost:8080)
    ↓ (axios → /api/*) 
PHP API (http://localhost:9000)
    ↓ [MISSING] HTTP client to Python
Python API (http://localhost:5000)
    ↓ [READ ONLY] Database queries
MySQL Database
    ↑ ↓
Redis Cache
```

---

## 2. CRITICAL MISSING CONNECTIONS

### 🔴 Issue 1: Python Flask API Not Connected to PHP Backend
**Location**: `backend/python/api/main.py`
- Endpoint: `POST /validate-vector` - **UNUSED**
- Function: Validates SKU descriptions against cluster vectors
- Problem: No PHP controller calls this endpoint
- Impact: Vector validation is bypassed

**Solution Required**: 
- PHP ValidationService to HTTP call `python:5000/validate-vector`
- Add Guzzle client to composer.json
- Create PythonWorkerClient service

---

### 🔴 Issue 2: AuditController Missing Python Integration
**Location**: `backend/php/src/Controllers/AuditController.php` (Lines 10)
```php
// In a real system, this would trigger the Python worker
// For now, we'll return a mock success
```
- Problem: Mock implementation only
- Expected: Should queue job to Python audit engines
- Impact: AI Audit feature non-functional

**Solution Required**:
- Implement job queue (Redis queue)
- Create `backend/python/src/ai_audit/audit_engine.py` invocation
- Add audit result callback mechanism

---

### 🔴 Issue 3: Frontend Service Configuration
**Location**: `frontend/src/services/api.js`
```javascript
baseURL: import.meta.env.VITE_API_URL || '/api'
```
- Problem: VITE_API_URL environment variable not defined anywhere
- Missing: `.env.local` or `vite.config.js` configuration
- Impact: Frontend connecting to wrong endpoints

**Solution Required**:
- Create `frontend/.env.local` with API_URL
- Update nginx.conf to proxy correctly
- Document environment setup in .env file

---

### 🔴 Issue 4: ValidationService Not Fully Implemented
**Location**: `backend/php/src/Services/ValidationService.php`
- Problem: Service exists but not orchestrating validation gates
- Gates implemented: G1-G4 validators exist but not called as pipeline
- Missing: Fail-safe mechanism, validation result persistence

**Solution Required**:
- Implement ValidationService.validate() method
- Chain gates: G1 → G2 → G3 → G4 (with python call)
- Store ValidationLog for audit trail

---

### 🔴 Issue 5: DatabaseConnection Not Wired
**Location**: `backend/php/src/Database/` (assumed exists)
- Problem: No database connection service visible
- Config: `config/database.php` not readable
- Impact: Models cannot persist data

**Solution Required**:
- Verify Eloquent/Laravel connection
- Check migration status
- Ensure DB_* env vars match docker-compose

---

## 3. WORKFLOW BROKEN PATHS

### Path 1: Create/Edit SKU
```
Frontend SkuEdit.jsx
    ↓ PUT /skus/{id}
PHP SkuController::update()
    ↓ [BROKEN] ValidationService NOT called
    ↓ [BROKEN] Should chain through Gates
Result: SKUs saved without validation ✗
```

### Path 2: Run AI Audit
```
Frontend AiAudit.jsx
    ↓ POST /audit/{sku_id}
PHP AuditController::runAudit()
    ↓ [BROKEN] Returns mock only, no Python call
Python AuditEngine
    ↓ [NEVER REACHED]
Result: No actual AI audit execution ✗
```

### Path 3: Validate Vector/Cluster
```
Frontend (implied)
    ↓ [MISSING] No endpoint calls vector validation
PHP ValidationService
    ↓ [BROKEN] validate_cluster_match() not called
Python validate_vector()
    ↓ [NEVER REACHED]
Result: Vector validation completely bypassed ✗
```

### Path 4: Brief Generation
```
PHP BriefController::store()
    ↓ [UNKNOWN] Python brief_generator not invoked
Python BriefGenerator
    ↓ [NEVER REACHED]
Result: Briefs not auto-generated ✗
```

---

## 4. INTERCONNECTION DEPENDENCIES

### Frontend → Backend
| Feature | Endpoint | Status |
|---------|----------|-----------|
| List SKUs | `GET /skus` | ✅ Wired |
| Get SKU | `GET /skus/{id}` | ✅ Wired |
| Create SKU | `POST /skus` | ✅ Wired |
| Update SKU | `PUT /skus/{id}` | ✅ Wired (validation missing) |
| Validate SKU | `POST /skus/{id}/validate` | ⚠️ Endpoint exists, not called |
| Run Audit | `POST /audit/{sku_id}` | ❌ Mock only |
| Get Briefs | `GET /briefs` | ✅ Wired |
| Create Brief | `POST /briefs` | ✅ Wired (generation missing) |
| Recalc Tiers | `POST /tiers/recalculate` | ⚠️ Not testing |

### PHP → Python
| Function | Endpoint | Status |
|----------|----------|-----------|
| Vector Validation | `POST python:5000/validate-vector` | ❌ Not implemented |
| AI Audit | Python job queue | ❌ Not implemented |
| Brief Generation | Python job queue | ❌ Not implemented |
| ERP Sync | Python schedule/queue | ❌ Not implemented |

### Database → Services
| Model | Table | Status |
|-------|-------|--------|
| Sku | skus | ✅ Migrations exist |
| ValidationLog | validation_logs | ✅ Migrations exist |
| AuditResult | audit_results | ✅ Migrations exist |
| ContentBrief | content_briefs | ✅ Migrations exist |
| TierHistory | tier_history | ✅ Migrations exist |

---

## 5. ENVIRONMENT CONFIGURATION

### Current `.env` Issues
```dotenv
# ❌ Missing
VITE_API_URL=           # Frontend
PYTHON_API_URL=         # PHP to call Python

# ⚠️ Mismatched
DB_PASSWORD=root1234    # .env
MYSQL_PASSWORD=cie_password  # docker-compose (DIFFERENT!)

# ⚠️ Incomplete
OPENAI_API_KEY=sk-...   # placeholder
ANTHROPIC_API_KEY=sk-ant-... # placeholder
```

---

## 6. REMEDIATION PRIORITY

### P0 - BLOCKING (Do First)
1. ✅ Install Flask package (DONE)
2. Create PHP HTTP client to Python
3. Implement ValidationService.validate()
4. Wire AuditController to job queue
5. Fix .env credentials consistency

### P1 - HIGH (Do Second)
6. Implement Python worker job handlers
7. Add Frontend environment config
8. Connect all Frontend API calls
9. Create response format decorators
10. Add comprehensive logging

### P2 - MEDIUM (Do Third)
11. Implement fail-soft mechanisms
12. Add audit trail persistence
13. Setup proper error handling
14. Create API documentation
15. Add data validation schemas

---

## 7. QUICK START FIXES

### Step 1: Fix Database Credentials
Update docker-compose to match .env:
```yaml
# backend/php/
environment:
  DB_PASSWORD: root1234  # Match .env
```

### Step 2: Create Frontend .env
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:9000/api
VITE_PYTHON_API_URL=http://localhost:5000
```

### Step 3: Add PHP HTTP Client
```bash
cd backend/php
composer require guzzlehttp/guzzle
```

### Step 4: Implement ValidationService
Create validation pipeline that:
1. Runs G1 (Title Intent Gate)
2. Runs G2 (Description Gate)
3. Runs G3 (Url Gate)
4. Runs G4 (Answer Block Gate)
5. Calls Python for vector validation
6. Persists result to ValidationLog

### Step 5: Wire AuditController
```php
$this->pythonClient->post('/audit', ['sku_id' => $sku_id]);
```

---

## 8. TESTING VERIFICATION

After fixes, verify:
```bash
# 1. Database connected
docker-compose exec php-api php artisan tinker
> App\Models\Sku::count();

# 2. Python API responding
curl -X GET http://localhost:5000/health

# 3. Frontend → PHP API
curl -X GET http://localhost:9000/api/skus \
  -H "Authorization: Bearer {token}"

# 4. PHP → Python API
# (should work after implementing HTTP client)
```

---

## NEXT STEPS

See [implementation section](#remediation-priority) for ordered list of fixes.

All code changes will be applied systematically with proper error handling and logging.
