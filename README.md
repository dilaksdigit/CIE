# CIE v2.3.2 - Catalog Intelligence Engine

## 🚀 Overview
CIE is an enterprise-grade product content management system designed for scale and intelligence. Built with a twin-engine architecture (PHP for core governance and Python for AI-powered processing), it automates product data enrichment, validation, and distribution.

## ✨ Key Features
- **AI-Powered Validation**: Multi-layer audit engine using LLMs (GPT-4, Claude 3.5, Gemini 1.5) for content accuracy.
- **Tier-Based Governance**: Advanced permission systems ensuring data integrity across organizational levels.
- **Automated Quality Enforcement**: Real-time validation gates for product data and media.
- **ERP Synchronization**: Seamless integration connectors for SAP, Dynamics 365, and custom ERPs.
- **Vector-Based Intelligent Search**: Semantic search capabilities for product catalogs.
- **Automated Marketing Copy**: Generation of SEO-optimized product descriptions and marketing briefs.

## 🛠 Tech Stack
### Core Modernization
- **Backend (Governance)**: [PHP 8.1+](file:///c:/Dilaksan/CIE/cie-v232/backend/php) (Laravel 9+ core patterns)
- **Backend (Intelligence)**: [Python 3.11+](file:///c:/Dilaksan/CIE/cie-v232/backend/python) (FastAPI, LangChain)
- **Frontend**: [React 18.2+](file:///c:/Dilaksan/CIE/cie-v232/frontend) (Vite, Zustand, Tailwind CSS)
- **Database**: MySQL 8.0 & Redis 7.0
- **AI/ML**: OpenAI, Anthropic, Google Vertex AI

## 📂 Project Structure
```text
├── backend/
│   ├── php/          # Core Business Logic & Governance API
│   └── python/       # AI Engines, Jobs, & ERP Sync Workers
├── frontend/         # Modern React SPA
├── database/         # Migrations, Seeds, and Schema DB
├── docs/             # Technical & User Documentation
├── infrastructure/   # Docker, K8s, and Terraform configs
├── monitoring/       # Prometheus/Grafana Dashboards
└── scripts/          # Automation & Setup utilities
```

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- PHP 8.1+ & Composer (for local development)
- Python 3.11+ (for local development)

### Quick Start (Docker)
1. **Clone and Setup ENV**:
   ```bash
   cp .env.example .env
   ```
2. **Launch Services**:
   ```bash
   docker-compose up -d --build
   ```
3. **Initialize Data**:
   ```bash
   make migrate
   make seed
   ```

### Local Development
Refer to the [Implementation from Scratch Guide](file:///c:/Dilaksan/CIE/cie-v232/IMPLEMENTATION_FROM_SCRATCH.md) for detailed local setup instructions.

## 📖 Documentation
Detailed documentation is available in the [`docs/`](file:///c:/Dilaksan/CIE/cie-v232/docs) directory:
- [API Specification](file:///c:/Dilaksan/CIE/cie-v232/docs/api)
- [Architecture Overview](file:///c:/Dilaksan/CIE/cie-v232/docs/architecture)
- [Deployment Guide](file:///c:/Dilaksan/CIE/cie-v232/docs/deployment)
- [User Guides](file:///c:/Dilaksan/CIE/cie-v232/docs/user_guides)

## ⚖️ License
Internal Engine - Confidential (Refer to [LICENSE](file:///c:/Dilaksan/CIE/cie-v232/LICENSE))
