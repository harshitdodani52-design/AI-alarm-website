# Alarm Frontend

React + Vite frontend for the AI-validated task alarm app.

## Setup

```bash
npm install
```

Create a `.env` file in this folder if your backend isn't on `http://localhost:8080`:

```
VITE_API_URL=http://localhost:8080
```

## Run

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Pages

- `/login`, `/signup` — auth
- `/` — dashboard: create alarms (IST time + repeat days), see existing alarms
- `/ring/:alarmId` — the ringing screen. Click "Test ring" on any alarm in the
  dashboard to preview it without waiting for the real time. Type 30–50 words,
  submit, and it calls the backend's `/api/tasks/validate` (which calls Claude)
  before stopping the alarm sound.

## Notes

- The JWT is kept in memory only (not localStorage), so refreshing the page
  logs you out for now. Wire up a `/api/auth/me` + refresh flow, or have the
  backend set an httpOnly cookie, if you want persistence across reloads.
- The actual "ring at the scheduled time in the background" behavior (e.g. via
  a Service Worker + Notifications API) isn't built yet — right now the ring
  screen is triggered manually via "Test ring". That's the natural next piece
  once this flow feels right.
