# Interactive Theme Voting App

This project contains the original React voting experience plus an Express/Mongoose API under `api/index.js`. Student authentication first checks the application database and then falls back to SSAAM's `ccs_students` collection. A successful SSAAM login clones the student record into the application database. Student login attempts store the request IP address, user agent, identifier, and result in `LoginLog`.

## Configuration

Copy `.env.example` to `.env` and set the following values:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Application MongoDB database, for example `theme_voting`. |
| `SSAAM_MONGO_URI` | MongoDB connection containing SSAAM's `ccs_students` collection. |
| `JWT_SECRET` | Long random signing secret for student and admin tokens. |
| `VITE_API_URL` | Browser URL for the API, normally `http://localhost:4000`. |
| `FRONTEND_URL` | Allowed frontend origin(s). |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Values used by the admin seed command. |

The SSAAM record's bcrypt `custom_password` is verified when present. For compatibility with SSAAM deployments that use the specified lastname-based password rule, the normalized lastname is also accepted as a fallback.

## Running

Install dependencies with `npm install`. Seed the initial admin with `npm run seed:admin`, then run the frontend and API together with `npm run dev`. The public voter experience is available at the Vite URL, and the admin panel is available at `/admin`.

For a production client build, run `npm run build`. The API can be started with `npm start`.

## API overview

| Area | Endpoints |
|---|---|
| Student auth | `POST /api/auth/student/login` |
| Student voting | `GET /api/themes`, `POST /api/votes` |
| Admin auth | `POST /api/auth/admin/login` |
| Theme management | `GET/POST /api/admin/themes`, `PUT/DELETE /api/admin/themes/:id` |
| User management | `GET /api/admin/users`, `DELETE /api/admin/users/:id` |
| Settings | `PUT /api/admin/settings/password`, `POST /api/admin/settings/reset-votes` |

The frontend stores the student JWT under `theme-voting-token` and the admin JWT under `theme-voting-admin-token` in `localStorage`, as requested.
