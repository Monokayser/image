# Netlify Deployment Notes

This project can publish the React frontend to Netlify, but the full application still requires:

- a Spring Boot backend
- a PostgreSQL database

Netlify should be used for the frontend only. The backend must be deployed on a Java-capable host such as Render, Railway, or another Spring-compatible platform.

## Frontend on Netlify

Netlify will use the root [netlify.toml](/H:/SPRING%202026%20Msc/Software%20development/Task%20Management%20System/netlify.toml):

- Base directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`

Set this frontend environment variable in Netlify:

```text
VITE_API_BASE_URL=https://your-backend-host.example.com
```

## Backend environment for public hosting

For a separated public frontend/backend deploy, set these backend environment variables on the backend host:

```text
APP_CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
SERVER_SESSION_COOKIE_SAME_SITE=none
SERVER_SESSION_COOKIE_SECURE=true
```

## Important note

Because this app uses session cookies, a real public deployment needs:

- HTTPS on both frontend and backend
- a backend host that allows Java + PostgreSQL
- matching CORS and cookie settings

Netlify alone is not enough for the full login-enabled app.
