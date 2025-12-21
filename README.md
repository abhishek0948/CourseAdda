# CourseAdda – Full Stack

Internship learning platform with RBAC: React 19 + Vite frontend, Node/Express + TypeScript backend, Supabase integration, and PDF/assignment flows.

## Demo Credentials
- Admin: admin@test.com / Admin123!
- Mentor: mentor@test.com / Mentor123!
- Student: student@test.com / Student123!

## Backend Setup (API)
1) Install deps
```
cd backend
npm install
```
2) Configure environment (copy and fill): see [backend/.env.example](backend/.env.example)
```
cp .env.example .env
```
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - Set `JWT_SECRET` and adjust `PORT` if needed
3) Start dev API
```
npm run dev
```
4) Build & run prod
```
npm run build
npm start
```
5) Tests (Jest)
```
npm test
```

## Frontend Setup (Web)
1) Install deps
```
cd frontend
npm install
```
2) Environment: create `frontend/.env`
```
VITE_API_BASE_URL=http://localhost:3000
```
   - Point to your running backend URL
3) Dev server (Vite)
```
npm run dev
```
4) Build & preview
```
npm run build
npm run preview
```

## My AI Usage
- AI tools used: Chatgpt, Gemini.
- How AI was used: accelerated test authoring/fixes (Vitest + Testing Library, Jest); suggested UI text/layout tweaks; guided Supabase connection/config (env wiring, client usage).
- Reflection: AI reduced debugging time for tests, speed up UI polish, and helped avoid Supabase setup pitfalls—overall higher productivity and faster learning feedback loops.
