# Median

Median is a mentorship marketplace for Nigeria and Africa. It connects vetted
mentors with mentees who need structured, paid career guidance.

Mentees find mentors, book and pay for sessions, and join them by video. Mentors
apply, get reviewed, publish sessions, set their availability and earn from
completed bookings.

## Tech stack

| Area     | Tools                                                  |
| -------- | ------------------------------------------------------ |
| Web      | Next.js 16, React 19, Tailwind CSS 4, TanStack Query   |
| API      | NestJS 11                                              |
| Database | PostgreSQL 16, Prisma 6                                |
| Services | Paystack, LiveKit, Cloudinary, Resend, Google/LinkedIn |
| Tooling  | Turborepo, npm workspaces, Jest                        |

Node.js 22.13 or newer is required.

## Project structure

```txt
apps/web                    Next.js frontend
apps/api                    NestJS backend
packages/database           Prisma schema, migrations, seeds and client
packages/shared             Shared TypeScript product types and constants
packages/ui                 Shared React UI package
packages/eslint-config      Shared ESLint config
packages/typescript-config  Shared TypeScript config
```

API modules are grouped by domain in `apps/api/src/modules`, and their unit tests
follow the same layout in `apps/api/test/unit/modules`:

```txt
identity/    auth, users, settings
profiles/    mentors, mentees, taxonomy
scheduling/  bookings, sessions, booking-notifications
finance/     payments, earnings, exchange-rates
engagement/  messages, community, reviews, achievements, async-qa
platform/    email, uploads
admin/
waitlist/
```

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment files from the examples, then fill them in (see
   [Environment](#environment)):

   ```bash
   cp .env.example .env.local
   cp apps/api/.env.example apps/api/.env.local
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Start PostgreSQL and set up the database. This needs Docker:

   ```bash
   npm run db:up
   npm run db:generate
   npm run db:migrate:deploy
   npm run db:seed
   ```

4. Start the apps:

   ```bash
   npm run dev
   ```

The web app runs on `http://localhost:3000` and the API on
`http://localhost:4000`, with routes under `/api/v1`.

## Commands

Run these from the repo root.

| Command                     | What it does                               |
| --------------------------- | ------------------------------------------ |
| `npm run dev`               | Starts all apps in development mode        |
| `npm run build`             | Builds everything                          |
| `npm run lint`              | Lints everything                           |
| `npm run check-types`       | Typechecks everything                      |
| `npm test`                  | Runs unit tests                            |
| `npm run test:e2e`          | Runs API end-to-end tests (needs database) |
| `npm run db:up`             | Starts the local PostgreSQL container      |
| `npm run db:down`           | Stops it and keeps the data                |
| `npm run db:logs`           | Follows the database logs                  |
| `npm run db:generate`       | Generates the Prisma client                |
| `npm run db:migrate`        | Creates and applies a migration in dev     |
| `npm run db:migrate:deploy` | Applies pending migrations                 |
| `npm run db:seed`           | Seeds baseline data                        |
| `npm run db:seed:demo`      | Seeds demo accounts and bookings           |
| `npm run db:purge:demo`     | Removes the demo data                      |
| `npm run db:studio`         | Opens Prisma Studio                        |

## Environment

Config is split across three files, none of which are committed:

| File                  | Used for                                         |
| --------------------- | ------------------------------------------------ |
| `.env.local`          | Prisma commands and the local Postgres container |
| `apps/api/.env.local` | API runtime                                      |
| `apps/web/.env.local` | Web runtime                                      |

The matching `.env.example` files list every variable.

### Database

Set the same values in `.env.local` and `apps/api/.env.local`:

```txt
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<database>?schema=public
DIRECT_URL=postgresql://<user>:<password>@localhost:5432/<database>?schema=public
POSTGRES_DB=<database>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
```

`DIRECT_URL` is required by the Prisma schema, but isn't in the example files yet,
so add it yourself. Locally it matches `DATABASE_URL`. With a connection pooler,
`DATABASE_URL` points at the pooler and `DIRECT_URL` at the database itself.

### API

| Variables                                        | Purpose                                     |
| ------------------------------------------------ | ------------------------------------------- |
| `PORT`, `API_PORT`                               | API port, defaulting to 4000                |
| `WEB_ORIGIN`, `WEB_ORIGINS`                      | Redirect target and allowed CORS origins    |
| `COOKIE_DOMAIN`                                  | Empty locally; `.medianhq.co` when deployed |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_REPLY_TO` | Email delivery                              |
| `CLOUDINARY_*`                                   | Signed file uploads                         |
| `GOOGLE_*`, `LINKEDIN_*`                         | Social sign-in                              |
| `PAYSTACK_SECRET_KEY`                            | Payments                                    |
| `EXCHANGE_RATE_USD_NGN`                          | Backup USD to NGN rate (see below)          |
| `LIVEKIT_*`                                      | Video sessions and realtime messaging       |
| `BACKOFFICE_ACCESS_KEY`                          | Admin and waitlist endpoints                |

If `RESEND_API_KEY` or `EMAIL_FROM` is missing, the API saves waitlist entries but
skips the confirmation email.

### Web

| Variables                  | Purpose                         |
| -------------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_URL`      | API address                     |
| `NEXT_PUBLIC_API_VERSION`  | API version, defaulting to `v1` |
| `NEXT_PUBLIC_SITE_URL`     | Public site address             |
| `NEXT_PUBLIC_CLOUDINARY_*` | Client uploads                  |
| `BACKOFFICE_ACCESS_KEY`    | Must match the API's value      |

## Demo data

`npm run db:seed:demo` creates approved mentors, mentees, bookings and
conversations, then prints the accounts and shared password. All demo emails use
`@demo.medianhq.co`, which is how `npm run db:purge:demo` finds them.

Never seed production.

## How key parts work

### Money and currency

- Mentors price sessions in NGN or USD, and the price is saved as entered.
- Mentees see prices in their local currency: NGN if their location or device
  points to Nigeria, otherwise USD.
- **Checkout is always in NGN.** The naira amount is fixed when the booking is
  created, and the listed price and rate are stored on the `Payment`.
- Refunds and mentor earnings work from that naira amount.
- The USD to NGN rate is fetched daily from `open.er-api.com` and held in memory.
  If a refresh fails, the last rate stays in use. If the API restarts during an
  outage it falls back to `EXCHANGE_RATE_USD_NGN`, and without that it refuses to
  book dollar-priced sessions rather than guess.

### Live booking updates

The mentor dashboard and bookings pages listen to `GET /api/v1/bookings/events`,
a Server-Sent Events stream. When a booking changes, the API tells the people
involved and their pages refetch. Events carry no booking data.

Events are held in the API's memory, so this assumes **one API instance**. A
second instance would need something like Redis between them. Behind a reverse
proxy, turn off response buffering for this route.

### Sessions and devices

Auth uses signed access and refresh cookies. Each browser also gets a
`median_device` cookie, which powers the active sessions list in settings. That
list is for display and sign-out; the auth tokens are what grant access.

### Mentor approval

Mentors apply and are reviewed before going public. Until approved, they can't
create sessions, put sessions live or be booked.

## Testing

```bash
npm test
npm run test:e2e
```

The end-to-end tests boot the full API, so they need a running database and also
start the background booking sweeper. Point them at a local database, never a
shared one.

## Deploying

1. Apply migrations before starting the new API version:

   ```bash
   npm run db:migrate:deploy
   ```

   The API won't run correctly against an out-of-date schema.

2. Set `EXCHANGE_RATE_USD_NGN` as a backup rate.
3. Run a single API instance on an always-on host. Live updates and the booking
   sweeper aren't built for serverless, and live updates assume one instance.

The API connects to the database on startup and exits if it can't, so make sure
your host restarts it automatically.

## Known gaps

- Calendar connections on the settings page aren't built yet.
- Only booking updates and cancellations honour the email notification toggles.
  The other types send no email yet, and in-app notifications don't exist yet.
- The fee shown on the session form (10% + $1) differs from the fee used for
  earnings (4% + ₦100).
- The "fee handling" options on the session form aren't saved.
- Explore price filters assume naira and only use a mentor's profile price.
- Mentor settings still use the older settings page.
