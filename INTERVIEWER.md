# Easily Job Portal — Interviewer Brief

This document gives a concise, engineering‑focused overview you can skim during interviews: what the product does, how it’s built, and the trade‑offs made.

## What it is

A job marketplace with two roles:

- Recruiters create, manage, and review applicants for their postings.
- Job seekers browse jobs, filter/search, and apply with a resume.

The UI is rendered server‑side (EJS) for fast first paint and simple hosting; CSS is responsive with per‑breakpoint tuning.

## Key flows (demo script)

- Recruiter: Register/Login → Post a job → Open job details → candidates apply → View Applicants list (owner‑only) with resume links → Update or delete the job.
- Seeker: Browse `/jobs` → search + filters → open a job → apply → view “My Applications” (search + pagination).

## Architecture

- Web server: Node.js + Express, ES modules.
- Views: EJS + express‑ejs‑layouts.
- Persistence: MongoDB via Mongoose.
- Authn/Authz: Express sessions; middleware for role + resource ownership.
- Files: Multer for resume/logo uploads, served from `/uploads/*` (demo simplicity).
- Email: Nodemailer (SMTP optional; falls back to JSON transport in dev).
- Utilities: dayjs, morgan, cookie‑parser, method‑override.

### Data model (simplified)

- User: `{ id (uuid), name, email (unique), password (demo), role: 'recruiter'|'seeker' }`
- Job: `{ id (uuid), company_name, job_designation, job_location, salary, experience, types[], levels[], skills_required[], featured, logo, createdAt, owner: userId, applicants: [ { userName, email, resume, appliedAt } ] }`

Notes

- Applicants are embedded per Job for simple atomic reads on details/applicants pages. This avoids joins and keeps queries fast for the demo scale. For very high scale, a separate `Application` collection would be appropriate.

## Request flow

- HTTP → route → controller (async) → model (Mongoose) → view render / redirect → flash messages via locals.
- Resource authorization middleware ensures only a job owner can update/delete or view applicants.

## Search & filters

- Term search expands common synonyms (e.g., “frontend” ↔ React/JS). Filters for date window, level, type, location; sort by recent/relevant/salary.
- Pagination with page/limit query params.

## Seeding strategy

- After a successful DB connect, a seed script inserts a diverse set of jobs if the DB is empty. This guarantees the filters and demos always have results without manual setup.

## Testing

- Smoke tests (node:test + supertest) verify the app boots and key routes respond. DB calls are guarded during tests to avoid hangs when a real DB isn’t present.

## Security & trade‑offs

- Sessions stored in memory for simplicity (switch to Redis in production).
- Passwords are plain in this demo (swap to bcrypt + salts for real use).
- File uploads are local for speed; production would offload to S3/Cloudinary with signed URLs and validation.
- CSRF protection is not wired for brevity; can be added via csurf or same‑site cookies as needed.

## Performance & UX

- SSR ensures low TTFB and crawlable pages.
- Media queries tailor layout for mobile/tablet/laptop/desktop.
- Long titles wrap and buttons wrap to new lines to avoid horizontal scroll.

## Deployment notes

- One‑click: any Node host that supports `npm start`. Provide `MONGODB_URI` and (optionally) SMTP vars. Dockerfile and Procfile are included for container/PaaS flows.

## What I’d do next

- Proper password hashing + login throttling.
- Move sessions to Redis and enable secure cookies.
- Extract Applications to its own collection; add workflow/status updates for applications.
- Add integration tests for auth + CRUD; wire CI.
- Use Cloud storage for uploads; virus scanning on resumes.
- Add OpenSearch/Atlas Search for full‑text relevance.

## Repo map

- `src/app.js` – express config
- `src/server.js` – connect DB then listen + seed
- `src/models/*.js` – Mongoose models
- `src/controllers/*.js` – route logic
- `src/middleware/*.js` – auth, authorize, upload, lastVisit
- `src/utils/*.js` – db connect, seed, mailer
- `views/*` – EJS pages + CSS
- `uploads/` – resumes/logos (dev)

This brief equips you to explain the system quickly and field follow‑ups on architecture, data modeling, and trade‑offs.
