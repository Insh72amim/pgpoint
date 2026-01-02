# PGPoint Architecture Strategy 🏛️

## 1. Context & Goal
We have two main applications sharing the same database:
1.  **PGHandle Backend (`pghandlebe`)**: The core administrative backend (MikroORM, Node.js).
2.  **PGPoint Marketplace (`pgpoint`)**: The tenant-facing frontend (Next.js, Prisma).

**Goal:** Avoid maintaining two separate backend services and avoid manually duplicating database schema changes in two places.

## 2. Core Architecture: Standalone Next.js
*   **No Separate Backend for Marketplace:** We do *not* create a separate Node/Express backend for `pgpoint`.
*   **Next.js as Backend:** The `pgpoint` Next.js application (App Router) acts as its own secure backend. It connects directly to the database using Prisma.
*   **Server Actions:** All database interactions happen inside Server Actions (`src/actions/`) or Server Components, ensuring secure, fast execution.

## 3. Workflow: "Single Source of Truth"
To solve the "changes twice" problem, we treat the **PGHandle Backend (`pghandlebe`)** as the source of truth for the database schema.

### The Cycle
1.  **Define:** You verify a need for a new field (e.g., `PG.images`) in `pghandlebe`.
2.  **Migrate:** You create and run the migration in `pghandlebe`. The physical database now has the new column.
3.  **Sync (Automated):** In `pgpoint`, you simply run:
    ```bash
    npx prisma db pull
    ```
    Prisma connects to the DB, sees the new column, and automatically updates `prisma/schema.prisma`.
4.  **Develop:** TypeScript immediately recognizes the new field, and you can start using it in your UI.

## 4. Key Benefits
*   **Performance:** `pgpoint` connects directly to the DB (1 hop) instead of going through an API (2 hops).
*   **Maintenance:** No need to write duplicate DTOs or API endpoints for simple data fetching.
*   **Security:** Admin APIs remain isolated in `pghandlebe`. Marketplace logic remains isolated in `pgpoint`.

## 5. Deployment
*   Both apps run on the same GCP VM.
*   `pgpoint` runs via PM2 on Port 3000.
*   `pghandlebe` runs via PM2 on its own port.
*   Both connect to `localhost:5432` for zero-latency database access.
