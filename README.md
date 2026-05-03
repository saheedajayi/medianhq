# Median

Median is a mentorship marketplace MVP for Nigeria and Africa. It connects vetted mentors with mentees who need structured, paid career guidance.

## Workspace

```txt
apps/web                 Next.js frontend
apps/api                 NestJS backend
packages/shared          Shared TypeScript product types/constants
packages/database        Prisma schema and database client
packages/ui              Generated shared React UI package
packages/eslint-config   Shared ESLint config
packages/typescript-config Shared TypeScript config
```

The repo was scaffolded with the official Turborepo and NestJS generators, then customized for Median.

## Commands

```bash
npm install
npm run dev
npm run build
npm run check-types
npm run db:generate
```

`npm run dev` starts the Turborepo dev pipeline. The frontend runs on `http://localhost:3000`; the generated NestJS API runs on its default port until we add the API config module.

## Database

Copy `.env.example` to `.env`, set `DATABASE_URL`, then run:

```bash
npm run db:generate
npm run db:migrate
```
# median-platform
