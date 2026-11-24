# Conforge Solutions Hub

A full-stack, enterprise solution accelerator portal designed for discovering, evaluating, and managing software solutions, technical architectures, and accelerators.

---

## Documentation

* **[BRANDING.md](BRANDING.md)**: Complete guide on the branding architecture, environment variables, asset locations, and instructions for customizing brand name, logo, favicon, and colors.
* **[PLAYWRIGHT.md](PLAYWRIGHT.md)**: Comprehensive guide for running, watching (headed & UI modes), debugging, and writing Playwright E2E browser tests.

---

## Architecture Overview

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Base UI, Shadcn UI components, TanStack Query, React Router v7.
* **Backend**: FastAPI, Python 3.12+, PostgreSQL (with pgvector), SQLAlchemy, LangGraph agent workflows, MinIO/S3 object storage.

---

## Quick Start

### 1. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Setup virtualenv and dependencies
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## Brand Configuration

Brand names are configured via environment variables.

In `frontend/.env`:
```env
VITE_BRAND_NAME=Conforge
VITE_BRAND_SUBTITLE=Solutions Hub
```

In `backend/.env`:
```env
BRAND_NAME=Conforge
PROJECT_NAME="Conforge Solutions Hub API"
```

Refer to **[BRANDING.md](BRANDING.md)** for detailed instructions on updating brand assets, logos, favicons, and theme palettes.
