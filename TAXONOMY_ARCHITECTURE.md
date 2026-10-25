# Taxonomy Architecture: Database vs. Frontend

This document explains what the **Taxonomy (Industries & Roles)** data is, how it is currently used across the Median platform, and whether it is better to store it in the database or keep it in the frontend.

---

## 1. What is this data?

The taxonomy consists of two related entities:
1. **Industries**: Top-level sectors (e.g. *Technology, Design, Finance, Healthcare, Marketing*).
2. **Roles**: Standard job titles belonging to each industry (e.g. *Technology → Software Engineer, Frontend Developer, Product Manager*).

### Where it is used in the app:
- **Mentee Onboarding** (`apps/web/features/auth/mentee-onboarding-page.tsx`): Dropdown for selecting current industry and role.
- **Mentor Onboarding** (`apps/web/features/auth/mentor-onboarding-page.tsx`): Dropdown for selecting primary domain and role.
- **Explore & Filters** (`apps/web/components/explore/filters-dialog.tsx`): Filtering mentors by industry and job title.
- **Custom Role Creation**: Users can type custom titles in the `CreatableCombobox` if their role is not listed.

---

## 2. How it currently works in the codebase

Currently, Median uses a **hybrid approach**:

```text
[Frontend: constants/industries.ts] (Instant defaults in bundle)
               │
               ▼
       [Merged in UI] <─── [Backend API: GET /taxonomy/industries] (Dynamic roles in PostgreSQL)
               │
               ▼
    [User Selects Role]
               │
               ▼
[Saved as plain text string in MenteeProfile / MentorProfile]
```

### Key Observation:
In `packages/database/prisma/schema.prisma`, `MentorProfile` and `MenteeProfile` store `industry` and `currentRole` as **plain optional strings (`String?`)**, **not foreign keys** to the `Industry` or `Role` tables:

```prisma
model MenteeProfile {
  id          String   @id @default(cuid())
  currentRole String?  // Plain string
  industry    String?  // Plain string
  ...
}
```

This means the database `Industry` and `Role` tables only serve as a **suggested dictionary/lookup list**, not a strict relational integrity constraint.

---

## 3. Database vs. Frontend: The Trade-offs

### Option A: Store in the Database

| Pros | Cons |
|---|---|
| **Dynamically extensible**: New industries and roles can be added via API (`POST /taxonomy/industries/:name/roles`) without redeploying the web app. | **Deployment overhead**: Requires seeding or migrating 400+ rows into PostgreSQL (`prisma db seed`). |
| **Admin manageable**: An admin dashboard can easily add, rename, or deprecate categories in the future. | **Latency & DB load**: The onboarding page must query the API before options appear (or fall back). |
| **Single source of truth**: If mobile apps (iOS/Android) or external services are added later, they share the exact same taxonomy API. | **Connection pool churn**: Running seeds on every deploy hits Supabase pooler limits. |

---

### Option B: Keep Purely in the Frontend (`constants/industries.ts`)

| Pros | Cons |
|---|---|
| **Zero database overhead**: No tables, no migrations, no seed script running on Render, zero DB connections used. | **Requires a deploy to update**: Adding a new industry or fixing a spelling mistake requires a code push and build. |
| **Instant UI rendering**: Dropdowns populate synchronously with 0ms network latency and no loading spinners. | **Code duplication if multi-client**: If you build a mobile app, you have to duplicate the list in the mobile repo or a shared package. |
| **Simpler codebase**: Deletes the `TaxonomyModule`, controller, service, queries, and Prisma models. | **No runtime user submissions**: When users type a custom role, it cannot be automatically added to the global catalog for other users to see. |

---

### Option C: The Hybrid Approach (Recommended for Median)

Median is **already partially structured for this**:

1. **Ship the static baseline in the frontend** (`apps/web/constants/industries.ts`):
   - Fast, reliable, never shows blank dropdowns even if the API is slow or offline.
2. **Store custom additions in the database**:
   - When a user types a new role (e.g., *"AI Prompt Engineer"*), the API saves it in the database.
   - The frontend merges: `{ ...DEFAULT_INDUSTRY_ROLES, ...taxonomyData }`.

---

## 4. Architectural Verdict: Is it a good idea?

### The Honest Recommendation:

1. **Do NOT run `npm run db:seed` on every Render deploy.**
   - Regardless of whether you use Option A, B, or C, re-seeding 400+ rows on every Git push is unnecessary.
   - Change your Render pre-deploy command to just:
     ```bash
     npm run db:migrate:deploy
     ```

2. **Keep the database tables, but treat them as an *expansion store*, not a deployment dependency:**
   - Because `constants/industries.ts` already contains all default roles, the frontend **never breaks** even if the database table is completely empty.
   - If you want a brand-new database to have the full catalog, run `npm run db:seed` **once manually** from your terminal, rather than having Render execute it automatically on every push.

3. **When to consider going 100% frontend:**
   - If you do not plan to build an Admin Taxonomy Manager or allow community-discovered roles to become globally searchable, you can delete the `Industry` and `Role` models entirely and rely 100% on `constants/industries.ts`.
