# Easily Job Portal (Express + EJS + MongoDB)

An MVC job portal where recruiters post/manage jobs and job seekers browse and apply. Built with Express, EJS, ES modules, sessions, Multer uploads, and Nodemailer emails. Data is persisted in MongoDB via Mongoose.

## Features

- MVC structure with controllers, models, routes, middleware
- EJS server-side rendering with a shared layout and responsive CSS
- Auth with roles: recruiter and job seeker (register/login/logout); navbar separates Recruiter vs Jobseeker entry points
- Cookie-based last-visit tracking (rendered as `lastVisit`)
- Jobs: list, details, create, update, delete
- Applicants: apply with resume upload, list all applicants per job
- My Applications page for seekers with search + pagination
- Resource authorization: only the posting recruiter can edit/delete a job
- Email confirmation after applying (Nodemailer)
- Search, filters, sorting and pagination for jobs/applicants
- Auto-seeding to MongoDB so filters always have results

## Tech stack

- Node.js, Express, EJS, express-ejs-layouts
- MongoDB + Mongoose (schemas for User and Job with embedded applicants)
- Sessions, cookie-parser, method-override, multer
- dayjs, morgan, nodemailer
- Testing: node:test + supertest

## Project structure

- `src/app.js` – Express app configuration
- `src/server.js` – Server bootstrap (connects to MongoDB, then seeds)
- `src/utils/db.js` – Database connection helper
- `src/utils/seed.js` – Seed script for initial jobs/users
- `src/controllers/*` – Auth and job controllers (async)
- `src/models/*` – Mongoose User and Job models
- `src/routes/*` – Route definitions
- `src/middleware/*` – Auth, resource authorization, last-visit cookie, Multer upload
- `views/` – EJS templates, CSS, images
- `uploads/` – Stored resumes and uploaded logos

## Setup

1. Install Node.js 18+ and MongoDB (local or Atlas).
2. Install dependencies.

```cmd
npm install
```

3. Configure environment variables.

```cmd
copy .env.example .env
```

Update `.env` with at least:

```
PORT=3201
SESSION_SECRET=replace_me
MONGODB_URI=mongodb://127.0.0.1:27017/easily
MAIL_FROM=no-reply@easily.dev
# Optional SMTP for real email delivery
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

4. Run in dev (auto-restart) or start.

```cmd
# Dev mode – attempts 3201, auto-switches to a free port if busy
npm run dev

# Production start
npm start
```

On first successful DB connection the app will seed a realistic set of jobs so filters and search have results.

### Quick MongoDB setup (Docker Compose)

1. Start MongoDB locally:

```cmd
docker compose up -d
```

2. Set your `.env` to point to the DB (example):

```
MONGODB_URI=mongodb://easily:password@127.0.0.1:27017/easily?authSource=admin
```

3. Optional: visit Mongo Express at http://localhost:8081 (user/pass: admin/admin).

### VS Code Task (optional)

Terminal → Run Task… → "Start Easily server" (runs `npm run dev`).

## Search, filters, and sorting

`GET /jobs` accepts:

- `q` – Free text search across title/company/location/skills (case-insensitive) with friendly synonyms
- `loc` – Location text; `india`/`bharat` matches all Indian cities
- `date` – `24h`, `3d`, `week`, `month`
- `levels` – One or many of: `Internship`, `Entry level`, `Associate`, `Mid-Senior`, `Director`
- `types` – One or many of: `Full-time`, `Part-time`, `Contract`, `Remote`
- `sort` – `recent` (default), `relevant`, `salary-high`, `salary-low`
- `page`, `limit` – Pagination

Examples:

```text
/jobs?q=software&loc=india&date=3d
/jobs?levels=Associate,Mid-Senior&types=Remote,Contract&sort=salary-high
/jobs?q=frontend&loc=bangalore&date=week&sort=relevant&page=2
```

## Environment variables (summary)

- `PORT` – HTTP port (server auto-detects free port if busy)
- `SESSION_SECRET` – Session secret
- `MONGODB_URI` – Mongo connection string
- `MAIL_FROM`, `SMTP_*` – Optional SMTP for real email; without SMTP, emails are logged via JSON transport

## Uploads & emails

- Resumes and company logos are uploaded to `uploads/` and served at `/uploads/<filename>`.
- Without SMTP config, application emails are logged in the server console.

## Endpoints (high level)

Auth

- POST `/register` – Recruiter/Seeker registration
- GET `/login`, POST `/login`, GET `/logout`
- GET `/signup` – Recruiter/Seeker signup page
- GET `/seeker/login`, POST `/seeker/login`
- GET `/seeker/signup`, POST `/seeker/register`

Jobs

- GET `/jobs` – List with search/filters/sort/pagination
- GET `/job/:id` – Details
- GET `/postjob`, POST `/job` – Create (auth)
- GET `/job/update/:id`, POST `/job/update/:id` – Update (owner-only)
- GET `/job/delete/:id` – Delete (owner-only)

Applicants

- POST `/apply/:id` – Apply (public; multipart `resume`)
- GET `/job/applicants/:id` – Recruiter-only view of applicants
- GET `/seeker/applications` – Seeker’s own applications (search + pagination)

JSON (optional)

- GET `/api/jobs`, GET `/api/jobs/:id`, POST/PUT/DELETE `/api/jobs/:id`

## Testing

The smoke tests (`node:test`, `supertest`) hit the home and jobs routes. The app guards DB operations in tests to avoid hangs if a real DB isn’t available.

```cmd
npm test
```

## Notes

- The server connects to MongoDB before listening; seeds run only after a successful connection.
- Static files in `uploads/` are served directly for demo simplicity.
- The server’s navbar shows separate Recruiter vs Jobseeker links when logged out; logged-in users see a quick link to “My Applications”.

## License

MIT
