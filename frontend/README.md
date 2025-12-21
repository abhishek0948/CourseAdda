# CourseAdda Frontend

React 19 + TypeScript + Vite app for CourseAdda. Includes auth flows (student/mentor/admin), dashboards, course management, and certificate actions.

## Prerequisites

- Node.js 20+
- npm (bundled with Node)

## Setup

1) Install dependencies
```
npm install
```

2) Environment

Create `.env` in the `frontend` directory:
```
VITE_API_BASE_URL=http://localhost:3000
```
Point this to your backend origin.

## Run

- Dev server (Vite, HMR):
```
npm run dev
```
- Production build:
```
npm run build
```
- Preview the production build locally:
```
npm run preview
```

## Quality

- Lint:
```
npm run lint
```

## Testing (Vitest + Testing Library)

- Headless tests:
```
npm test
```
- Interactive UI runner:
```
npm run test:ui
```
- Coverage report:
```
npm run test:coverage
```

## Project Notes

- API client reads `VITE_API_BASE_URL` and adds the auth token from `localStorage` to every request.
- 401 responses clear stored auth and redirect to `/login`.
- Routing uses React Router v7; protected routes live in `src/components/ProtectedRoute.tsx`.
