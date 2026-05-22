# TalentOS: Dynamic Metadata-Driven AI App Generator Platform

TalentOS is a production-grade, highly resilient, metadata-driven internal developer platform (similar to Retool / Base44) that dynamically generates fully interactive UIs, forms, tables, database models, schema-safe REST CRUD APIs, and background workflow automations from a declarative JSON configuration.

## Key Core Features

1. **Dynamic Rendering Engine:** A resilient layout dispatcher (`DynamicRenderer`) that recursively constructs dashboard grids, statistics cards, metrics widgets, dialog overlays, forms, and data tables wrapped completely in React Error Boundaries to prevent runtime crashes.
2. **Schema-Safe CRUD Router (`/api/[collection]`):** A single generic REST endpoint matching GET, POST, PUT, and DELETE methods that handles collection paths dynamically, maps fields directly inside a high-performance indexed PostgreSQL `JSONB` record schema, and isolates transactions.
3. **Dynamic Zod Validation:** Dynamically synthesizes validation schemas from config definitions at runtime, supporting string ranges, email patterns, select/dropdown options, optional fields, and default values.
4. **Asynchronous Workflow Engine:** A lightweight trigger-action system that fires background rules on form submissions, performs templated string interpolation (e.g. `{{studentName}}`), carries out notifications, logs, and mock webhooks, and logs telemetry.
5. **Interactive Config Editor:** A split-screen interactive dashboard where developers can modify JSON layouts directly with hot-reloading side-by-side previews and syntax error overlays.
6. **AI App Creator:** Accepts natural language prompt requests (e.g. "Create a project backlog planner") and autocompiles functional templates instantly using OpenAI abstractions or a local rule-based heuristic builder.
7. **Postman-like API Explorer:** A built-in HTTP request client that enables manual REST endpoint testing (GET, POST, PUT, DELETE) and validates input schemas directly inside the console interface.
8. **GitHub & Schema Exports:** Allows quick JSON schema configuration downloads to commit to code repositories.

---

## Technical Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4, Zustand, React Hook Form, Zod.
- **Backend:** Next.js Dynamic API Routes, Prisma ORM, NextAuth.js.
- **Database:** PostgreSQL (Neon Serverless compatible).

---

## Project Folder Map

```
src/
 ├── app/
 │    ├── page.tsx                    # Root redirection handle
 │    ├── login/page.tsx              # Multi-auth glassmorphic login screen
 │    ├── dashboard/page.tsx          # Master active apps console
 │    ├── editor/page.tsx             # Interactive config editor & live preview
 │    ├── workflows/page.tsx          # Automation triggers & logs trace explorer
 │    ├── explorer/page.tsx           # Built-in REST API Postman explorer
 │    ├── api/
 │    │    ├── auth/[...nextauth]/    # NextAuth authorization handler
 │    │    ├── config/                # Apps configurations save & fetch
 │    │    ├── ai/                    # Prompt apps generator endpoint
 │    │    ├── workflows/logs/        # Background execution telemetry logs
 │    │    └── [collection]/          # Dynamic CRUD engine (GET, POST, PUT, DELETE)
 ├── components/
 │    ├── providers.tsx               # NextAuth session wrappers
 │    ├── dashboard-layout.tsx        # Responsive developer console shell
 │    ├── dynamic/                    # Dynamic registry widgets
 │    │    ├── DynamicRenderer.tsx    # Central layout dispatcher & error boundary
 │    │    ├── DynamicForm.tsx        # Dynamic form builder & Zod resolver
 │    │    ├── DynamicTable.tsx       # Live database viewer & delete control
 │    │    ├── DynamicCard.tsx        # Grid panel grouping boxes
 │    │    ├── DynamicStats.tsx       # Reactive KPI metrics counter
 │    │    ├── DynamicModal.tsx       # Dialog popover panel triggers
 │    │    ├── FallbackComponent.tsx  # Unrecognized widget placeholder debugger
 │    │    └── ...
 ├── lib/
 │    ├── prisma.ts                   # Singleton Prisma client initializer
 │    ├── auth.ts                     # NextAuth options & automatic admin seeding
 │    └── workflows/
 │         └── workflowEngine.ts      # Template interpolator & action dispatchers
 ├── store/
 │    └── useAppStore.ts              # Global Zustand state manager
 └── types/
      └── index.ts                    # TypeScript shared interfaces
```

---

## Local Setup & Launch Guide

### 1. Configure Environments
Copy the template `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Provide your PostgreSQL connection string inside `DATABASE_URL` (fully compatible with Neon connection strings).

### 2. Generate Prisma Assets & Sync Database
Run the schema generator to compile database models:
```bash
npx prisma generate
```
Apply the migrations to sync tables inside your database cluster:
```bash
npx prisma db push
```

### 3. Launch Development Server
Start the local server node:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## Default Access Credentials

TalentOS incorporates an **automatic seed system** on first login. To explore the database and dashboards instantly with zero configuration, sign in using:

- **Developer Email:** `admin@talentos.dev`
- **Access Password:** `admin123`

The database will dynamically create and hash this administrator user on submission and load default templates (e.g. Student Portal) directly into your app registry!
