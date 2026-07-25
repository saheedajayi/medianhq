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

`npm run dev` starts the Turborepo dev pipeline. The frontend runs on `http://localhost:3000`; the NestJS API runs on `http://localhost:4000`.

## Environment

Local runtime config is split by app:

```txt
apps/api/.env.local
apps/web/.env.local
```

The root `.env.local` keeps `DATABASE_URL` for Prisma workspace commands and
the local PostgreSQL container settings.

## Database

Median uses PostgreSQL through Prisma. For local development, start the included
PostgreSQL 16 container and apply the migrations:

```bash
npm run db:up
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
```

Copy `.env.example` to `.env.local`, choose a local-only PostgreSQL password,
and build `DATABASE_URL` from the same database name, user, and password. Keep
the values blank in the checked-in example:

```txt
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>?schema=public
POSTGRES_DB=<database>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
```

Copy `apps/api/.env.example` to `apps/api/.env.local` if it does not already
exist, then set its `DATABASE_URL` to the same value. The API loads that URL and
connects when NestJS starts.

To stop PostgreSQL, run `npm run db:down`. The database data is retained in the
`median_postgres_data` Docker volume.

## Email

Waitlist confirmation emails are sent through Resend from the API. Configure
these variables in `apps/api/.env.local` before enabling email delivery:

```bash
RESEND_API_KEY="re_..."
EMAIL_FROM="Median <hello@medianhq.co>"
EMAIL_REPLY_TO="hello@medianhq.co"
```

If `RESEND_API_KEY` or `EMAIL_FROM` is missing, the API saves waitlist entries
but skips sending the confirmation email.
# median-platform
