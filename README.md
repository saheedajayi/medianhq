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

The root `.env.local` only keeps `DATABASE_URL` for Prisma workspace commands.

## Database

Set `DATABASE_URL` in the root `.env.local`, then run:

```bash
npm run db:generate
npm run db:migrate
```

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
