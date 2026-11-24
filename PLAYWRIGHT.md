# Playwright E2E Testing Guide

This document describes how to run, watch, debug, and write End-to-End (E2E) browser tests for the **Conforge Solutions Hub** frontend application using [Playwright](https://playwright.dev/).

---

## 🚀 Quick Start Commands

Navigate to the `frontend` directory before running any test command:

```bash
cd frontend
```

### 1. Interactive Visual Studio (UI Mode) — *Recommended for Development*
Opens Playwright's visual dashboard with time-travel scrubbing, DOM snapshots, network inspector, and live locator picker:

```bash
npm run test:e2e:ui
```
* **How to use**: Click the **▶ (Play)** button next to any test spec in the left panel. The right-hand panel renders the app live. You can scrub across the execution timeline to see the page state before and after each action.

---

### 2. Live Headed Mode (Watch a Real Chromium Browser)
Launches a real Chromium browser window directly on your desktop:

```bash
# Normal execution speed:
npm run test:e2e:headed

# Slow-Motion execution (600ms delay per action to easily watch live typing and clicks):
npm run test:e2e:watch

# Custom slow-motion delay (e.g. 1000ms):
SLOWMO=1000 npx playwright test --headed
```

---

### 3. Fast Headless Mode (CI / Terminal)
Executes all E2E test suites in headless Chromium and outputs a concise CLI summary:

```bash
npm run test:e2e
# or
npx playwright test
```

---

### 4. View Test Report & Artifacts
Opens the interactive HTML report detailing execution times, passes, failures, and attached screenshots/videos:

```bash
npm run test:e2e:report
```

---

## 🎯 Running Specific Tests

Run an individual test file:
```bash
# Auth tests:
npx playwright test e2e/auth.spec.ts --headed

# Navigation tests:
npx playwright test e2e/navigation.spec.ts --headed

# Dashboard tests:
npx playwright test e2e/dashboard.spec.ts --headed

# Solutions wizard tests:
npx playwright test e2e/solutions.spec.ts --headed

# Categories tests:
npx playwright test e2e/categories.spec.ts --headed

# AI Chat assistant tests:
npx playwright test e2e/chat.spec.ts --headed
```

Run tests matching a specific title keyword:
```bash
npx playwright test -g "redirects unauthenticated" --headed
```

---

## 📁 Test Suite Structure

```
frontend/
├── playwright.config.ts          # Central test runner and browser configuration
└── e2e/
    ├── fixtures/
    │   └── mock-data.ts          # Mock data, auth tokens, and API network interceptor
    ├── auth.spec.ts              # Login page, input validation, and successful authentication
    ├── navigation.spec.ts        # Sidebar links, brand header, breadcrumbs, and route integrity
    ├── dashboard.spec.ts         # Metric cards (total solutions, active categories), recent solutions
    ├── categories.spec.ts        # Category cards grid, category details, solutions count badge
    ├── solutions.spec.ts         # Multi-step solution creation wizard (General info, tech stack, assets)
    └── chat.spec.ts              # AI Assistant chat workspace, input composer, and conversation list
```

---

## 🔌 API Mocking vs. Live Backend Testing

By default, tests use `setupApiMocks(page)` defined in [frontend/e2e/fixtures/mock-data.ts](file:///home/anuroop-tm/Work/tm-solution-hub/frontend/e2e/fixtures/mock-data.ts):

* **Deterministic & Fast**: Tests run without requiring an active PostgreSQL database, MinIO S3 server, or seeded mock solutions.
* **CORS & Preflight Handling**: Intercepts requests targeting `http://localhost:8000/api/**` and returns valid CORS headers (`access-control-allow-origin: *`) and predefined responses.
* **Non-Interfering**: Only intercepts backend API requests and never blocks Vite frontend static assets or ES modules.

### Testing Against a Real FastAPI Backend
To test against a real running backend (`uvicorn app.main:app` on port 8000):
1. Start your backend services:
   ```bash
   cd backend
   uvicorn app.main:app --port 8000
   ```
2. In your test, simply omit `setupApiMocks(page)` and log in using genuine database credentials.

---

## 🛠️ Debugging Test Failures

When a test fails, Playwright automatically saves forensics into `frontend/test-results/`:
1. **Screenshots**: `.png` image captured at the exact moment of failure.
2. **Video Recordings**: `.webm` video recording of the entire test session.
3. **Trace Viewer**: Inspect step-by-step DOM state, network timeline, and console logs:
   ```bash
   npx playwright show-trace test-results/<test-folder>/trace.zip
   ```
