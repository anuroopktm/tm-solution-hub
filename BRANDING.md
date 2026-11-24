# Brand Architecture & Rebranding Guide

This document provides a comprehensive reference on how branding is implemented across the **Solutions Hub** platform, which environment variables control it, where the brand assets and names are referenced, and step-by-step instructions for customizing or rebranding the application.

---

## 1. Brand Environment Variables

The brand name and subtitle are dynamically driven by environment variables across both the frontend and backend.

### Frontend (`frontend/.env` / `frontend/.env.example`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_BRAND_NAME` | `Conforge` | Primary brand / company name displayed in the sidebar, titles, and dialogs. |
| `VITE_BRAND_SUBTITLE` | `Solutions Hub` | Product name / suite descriptor displayed under the brand name in the sidebar. |
| `VITE_API_URL` | `http://localhost:8000/api` | Base URL for backend API communications. |

### Backend (`backend/.env` / `backend/.env.example`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `BRAND_NAME` | `Conforge` | Brand name injected into AI assistant system prompt and responses. |
| `PROJECT_NAME` | `Conforge Solutions Hub API` | Title displayed in OpenAPI documentation (`/docs`, `/redoc`). |

---

## 2. Centralized Brand Configuration

All frontend components consume brand metadata from a single centralized TypeScript module:

**File**: [`frontend/src/config/brand.config.ts`](frontend/src/config/brand.config.ts)

```typescript
export const BRAND_CONFIG = {
  name: import.meta.env.VITE_BRAND_NAME || "Conforge",
  subtitle: import.meta.env.VITE_BRAND_SUBTITLE || "Solutions Hub",

  get fullName(): string {
    return this.subtitle ? `${this.name} ${this.subtitle}` : this.name;
  },

  get pageTitle(): string {
    return this.subtitle ? `${this.name} - ${this.subtitle}` : this.name;
  },
} as const;
```

---

## 3. Brand References Inventory

Below is the complete map of every file in the codebase where the brand name, logo, or icon is defined or consumed:

| Location / File | Type | Purpose & Consumption |
| :--- | :--- | :--- |
| [`frontend/.env`](frontend/.env) | Configuration | Sets `VITE_BRAND_NAME` and `VITE_BRAND_SUBTITLE`. |
| [`frontend/.env.example`](frontend/.env.example) | Template | Documents brand variables for new environments / developers. |
| [`frontend/src/vite-env.d.ts`](frontend/src/vite-env.d.ts) | TypeScript Types | Type declarations for `VITE_BRAND_NAME` and `VITE_BRAND_SUBTITLE`. |
| [`frontend/src/config/brand.config.ts`](frontend/src/config/brand.config.ts) | Configuration | Single source of truth for brand name, subtitle, full name, and page title. |
| [`frontend/index.html`](frontend/index.html) | HTML Template | Uses `%VITE_BRAND_NAME% - %VITE_BRAND_SUBTITLE%` in the `<title>` tag. |
| [`frontend/src/main.tsx`](frontend/src/main.tsx) | Application Entry | Synchronizes `document.title` with `BRAND_CONFIG.pageTitle` on startup. |
| [`frontend/src/components/app-sidebar.tsx`](frontend/src/components/app-sidebar.tsx) | UI Component | Renders the brand logo icon (`<ConforgeIcon />`) and text (`BRAND_CONFIG.name`, `BRAND_CONFIG.subtitle`). |
| [`frontend/src/components/conforge-logo.tsx`](frontend/src/components/conforge-logo.tsx) | SVG Component | Reusable vector components: `<ConforgeIcon />` (logo mark) and `<ConforgeWordmark />` (full logo). |
| [`frontend/public/favicon.svg`](frontend/public/favicon.svg) | Static Asset | Browser favicon featuring the brand logo mark with automatic light/dark mode support. |
| [`frontend/src/features/users/components/user-form-dialog.tsx`](frontend/src/features/users/components/user-form-dialog.tsx) | UI Component | Mentions `${BRAND_CONFIG.fullName}` in the user creation dialog description. |
| [`frontend/src/components/navigation/logout-dialog.tsx`](frontend/src/components/navigation/logout-dialog.tsx) | UI Component | Mentions `${BRAND_CONFIG.fullName}` in the logout confirmation dialog. |
| [`frontend/src/global.css`](frontend/src/global.css) | Stylesheet | Theme color definitions (Forge Teal `#008080`, Forge Black `#1A2424`, Forge White `#F5F7F7`). |
| [`backend/.env`](backend/.env) | Configuration | Sets `BRAND_NAME` and `PROJECT_NAME`. |
| [`backend/.env.example`](backend/.env.example) | Template | Documents backend brand configuration. |
| [`backend/app/core/config.py`](backend/app/core/config.py) | Python Settings | Pydantic Settings model exposing `settings.BRAND_NAME` and `settings.PROJECT_NAME`. |
| [`backend/app/main.py`](backend/app/main.py) | FastAPI Entry | Uses `settings.PROJECT_NAME` for the OpenAPI documentation title. |
| [`backend/app/chat/graph.py`](backend/app/chat/graph.py) | AI Agent | Uses `settings.BRAND_NAME` in the LLM System Prompt. |

---

## 4. How to Change the Brand

### Step 1: Change Brand Name and Subtitle
1. Open `frontend/.env` (and create `.env.local` if overriding locally):
   ```env
   VITE_BRAND_NAME=YourBrand
   VITE_BRAND_SUBTITLE=Solutions Hub
   ```
2. Open `backend/.env`:
   ```env
   BRAND_NAME=YourBrand
   PROJECT_NAME=YourBrand Solutions Hub API
   ```
3. Restart your dev servers or rebuild the frontend:
   ```bash
   cd frontend && npm run build
   ```

### Step 2: Change the Brand Logo / Icon
1. **Sidebar and In-App Logo**:
   - Open [`frontend/src/components/conforge-logo.tsx`](frontend/src/components/conforge-logo.tsx).
   - Replace the SVG paths in `ConforgeIcon` (standalone icon) or `ConforgeWordmark` (full wordmark) with your new brand vector paths.
   - You can also pass custom colors via the `starColor` and `forgeColor` / `textColor` props.
2. **Browser Favicon**:
   - Open [`frontend/public/favicon.svg`](frontend/public/favicon.svg).
   - Update the SVG vector path data and colors. The built-in media query automatically handles theme adaptability:
     ```css
     @media (prefers-color-scheme: dark) { ... }
     ```

### Step 3: Change the Brand Color Palette
The platform uses CSS custom properties defined in [`frontend/src/global.css`](frontend/src/global.css).
- **Forge Teal (Primary)**: `hsl(180 100% 25.1%)` (#008080)
  - Controlled by `--primary`, `--sidebar-primary`, etc.
- **Forge Black (Dark background & text)**: `hsl(180 16% 12%)` (#1A2424)
- **Forge White (Light surface)**: `hsl(180 11% 98%)` (#F5F7F7)
- **Accent Cyan**: `hsl(180 77% 64%)` (#60E8E8)

Updating these variables automatically cascades through all Tailwind classes (`bg-primary`, `bg-sidebar-primary`, `text-primary`, etc.).

---

## 5. Verification Commands

After making branding changes, verify that types, bundling, and tests pass:

```bash
# Frontend
cd frontend
npm run build      # Verifies TypeScript types and Vite build
npm run lint       # Verifies linting
npm test           # Runs Vitest suite (126 tests)
```
