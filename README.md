# ADAPT Technologies — Website & Management Platform

Official website and content-management platform for **ADAPT Technologies** (Lesotho).
*Intelligent Solutions. Real Impact.* — *Local Talent. Global Vision.*

Built with **Next.js (App Router) + PostgreSQL (Prisma)** and a custom admin CMS
behind role-based authentication.

---

## Stack

| Layer        | Tech                                              |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 15 (App Router, React 19, TypeScript)     |
| Styling      | Tailwind CSS 3                                     |
| Database     | PostgreSQL 14+, Prisma ORM                        |
| Auth         | Custom JWT session cookie (jose) + bcrypt (bcryptjs) |
| Validation   | zod                                              |
| Email        | nodemailer (SMTP, optional — logs to console if unset) |
| Media        | sharp (re-encode + MIME sniff on upload)          |
| Tests        | vitest (route handlers against a test database)   |

---

## Getting started

### 1. Prerequisites

- Node.js 20+ (developed on v22)
- PostgreSQL — any of:
  - a system service, or
  - the included user-space cluster: `scripts/dev-pg.sh start` (port **5433**,
    socket `/tmp/adapt-pg`, data dir `~/.local/share/adapt-pg`)

### 2. Configure environment

```bash
cp .env.example .env
```

Then edit `.env`. The important values:

| Variable                | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `DATABASE_URL`          | Main database (dev/prod)                       |
| `TEST_DATABASE_URL`     | Separate database used by vitest (destroyed freely) |
| `SESSION_SECRET`        | `openssl rand -base64 48`; signs session JWTs  |
| `ADMIN_EMAIL/PASSWORD`  | Account created by the seed script (change after first login) |
| `CONTACT_EMAIL`         | Inbox notified on contact + investor inquiries |
| `SMTP_*`                | Optional outbound email config                 |
| `NEXT_PUBLIC_SITE_URL`  | Public base URL (canonical/OG tags)            |

### 3. Migrate and seed

```bash
npm run db:push        # or: npm run db:deploy  (applies committed migrations)
npm run db:seed        # creates roles + the initial Super Admin
```

> `db:seed` is idempotent; run it once to bootstrap the admin account, then
> change the password from the dashboard (Admin → Settings).

### 4. Run

```bash
npm run dev            # http://localhost:3000
```

Admin login: `/admin/login` · Dashboard: `/admin`

---

## Database management scripts

`scripts/dev-pg.sh` manages a user-space PostgreSQL 18 cluster (no root/sudo):

```bash
bash scripts/dev-pg.sh status   # is it running?
bash scripts/dev-pg.sh start    # start the cluster
bash scripts/dev-pg.sh stop     # stop it
bash scripts/dev-pg.sh create   # create adapt/adapt_dev/adapt_test if missing
```

npm helpers: `npm run dev:pg` and `npm run dev:pg:stop`.

---

## Testing

Tests exercise the API route handlers directly (no network) against the database
in `TEST_DATABASE_URL`. They are destructive — test data is wiped on setup.

```bash
npm test                 # run once
npm run test:watch       # watch mode
```

The test DB must exist and have the schema applied:

```bash
bash scripts/dev-pg.sh start
# create DATABASE_URL, TEST_DATABASE_URL in .env (copy from .env.example)
TEST_DATABASE_URL="postgresql://adapt@127.0.0.1:5433/adapt_test" npx prisma migrate deploy
npm test
```

Test files live in `tests/`:
- `helpers.ts` — seeds roles/admin, builds authenticated `NextRequest`s
- `auth.test.ts` — login, sessions, password hashing, rate limits, roles
- `contact.test.ts` — contact, investor, page-tracking endpoints + CSRF
- `content.test.ts` — projects + achievements CRUD (admin)
- `security.test.ts` — auth gating, disabled users, role escalation, CSRF

---

## Platform overview

### Public site

- Home, About, Services, Projects, Achievements, Investors, Contact, legal pages
- Fully server-rendered; content is driven from the CMS
- Open Graph / Twitter cards, sitemap, and robots (see `src/lib/seo.ts`)

### Admin CMS (`/admin`)

Sections: Dashboard · Achievements · Projects · Announcements · Messages ·
Investors · Media · Site Content · Users · Settings

- **Roles** (seeded): `SUPER_ADMIN` (`*`), `CONTENT_ADMIN`
  (`dashboard.view/content.manage/media.manage`), `COMMS_ADMIN`
  (`dashboard.view/comms.manage`)
- Content admins manage content & media; comms admins manage messages/investors;
  only a Super Admin can manage users/settings (role + permissions are re-read from
  the database on every request, so a forged or stale token cannot escalate roles).

### Security

- httpOnly, SameSite session cookie signed with JWT (configurable `SESSION_COOKIE`)
- Every request re-validates the user and role against the DB (`/api/auth/me` too)
- CSRF protection on all state-changing endpoints — custom
  `x-adapt-requested-with: adapt-client` header + Origin/Host match
  (`src/lib/csrf.ts`)
- In-memory rate limits: login (10 / 15 min), contact (25 / hr), investor (15 / hr)
- Upload validation: extension allow-list, MIME sniffing, sharp re-encode, 8 MB cap
- Audit trail (`ActivityLog`) for significant admin operations
- No secrets in the repo; `.gitignore` excludes `.env` and user uploads

### Content model (`prisma/schema.prisma`)

`User`, `Role`, `Permission`, `Project`, `Achievement`, `Announcement`,
`ContactMessage`, `InvestorInquiry`, `Media`, `SiteSetting`, `PageView`,
`ActivityLog`.

`SiteSetting` holds the editable site copy (company, founder, contact, social,
home, investor, roadmap, legal, analytics) — everything unverified is stored as
placeholder text the site owner edits in Admin → Site Content.

---

## Deployment

```bash
npm ci
npm run build        # prisma generate + next build
npm run db:deploy    # apply migrations on the production DB
npm run db:seed      # first-time admin bootstrap (idempotent)
npm run start        # production server
```

Notes:
- Set `NEXT_PUBLIC_SITE_URL` to the real public URL so canonical/OG tags resolve.
- Configure `SMTP_*` in production so inquiry notifications are emailed.
- Uploaded media is stored under `public/uploads` (keep that writable, e.g. a
  mounted volume on Vercel/Railway/Fly); local filesystem is the default driver.
- Rate limits are per-process and in-memory — with multiple instances, scale them
  out and/or add a shared store for strict enforcement.
- Rotate `SESSION_SECRET` and the admin password before/go-live, and never commit
  `.env`.

---

## Useful commands

```bash
npm run typecheck    # tsc --noEmit
npm run build        # prisma generate && next build
npm test             # vitest run
npm run db:studio    # Prisma Studio (visual DB editor)
npm run db:migrate   # create migration after schema changes
```