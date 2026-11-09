# MediSense AI — free-tier demo deployment

> This configuration is for a non-clinical demo only. Do not enter real patient data or use it to make care decisions. Free hosting has no production reliability, backup, or clinical compliance guarantees.

## Suggested services

- **Frontend:** Render Static Site (free).
- **Backend:** Render Web Service (free; sleeps when idle).
- **Database:** Supabase Free PostgreSQL. Configure its connection string as `DATABASE_URL` on the backend.
- **AI:** OpenRouter, using a private server-side `OPENROUTER_API_KEY`.

## Deploy from GitHub

1. Push this project to a GitHub repository and sign in to Render.
2. Create a Render **Web Service** from the repository. Set **Root Directory** to `backend`, **Build Command** to `npm ci && npm run build`, and **Start Command** to `node dist/server.js`. Choose the Free instance type.
3. Add backend environment variables: `NODE_ENV=production`, `PORT=10000`, `DATABASE_URL` (Supabase connection string), `JWT_SECRET` (long random value), `OPENROUTER_API_KEY` (secret), and optionally `OPENROUTER_MODEL` and `APP_URL`. Never commit these values.
4. Create a Render **Static Site** from the same repository. Set **Root Directory** to `frontend`, **Build Command** to `npm ci && npm run build`, and **Publish Directory** to `dist`. Add `VITE_API_BASE_URL` with the public URL of the backend service (for example, `https://your-api.onrender.com`, without a trailing slash).
5. Redeploy the static site after setting `VITE_API_BASE_URL`. Verify the backend `/health` endpoint and the frontend.

## Free-tier limitations

Render free web services spin down after inactivity and have ephemeral local filesystems. Render free Postgres expires after 30 days, so use a separately managed database and maintain your own backups. Supabase Free projects can be paused for inactivity. Confirm current quotas and terms before deployment.

## Features not yet production-integrated

- Voice uses browser speech APIs and depends on the browser/device.
- Video doctor is currently an avatar-style interface, not a real-time generated talking doctor or clinician video visit.
- IVRS notification/call flows are simulated; real phone calls require a configured telephony provider, verified numbers, consent, and applicable regulatory review.
- Do not treat the app's demo login, sample personas, notifications, emergency dispatch, prescriptions, or claims as real services.
