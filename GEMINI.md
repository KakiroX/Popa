# Implementation Prompt: EduTech Squad Navigator (Gemini Edition)

---

## PROJECT OVERVIEW

Build a full-stack web application called **"Squad Navigator"** — a platform that groups students from different disciplines into multidisciplinary teams and assigns them AI-generated real-world challenges. The platform solves student isolation by creating collaborative squads (e.g., a developer + a business analyst + a designer + a marketer) and an embedded AI coach that generates tailored competitions and tasks for each squad.

---

## TECH STACK (NON-NEGOTIABLE)

- **Frontend:** Next.js 14+ (App Router), TypeScript
- **Backend:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL via **Supabase free tier** (use `supabase-py` on backend, Supabase JS client on frontend for auth)
- **Containerization:** Docker + Docker Compose (one command: `docker compose up`)
- **AI:** Google Gemini API (`gemini-2.0-flash` model) via `google-generativeai` Python SDK for squad challenge generation
- **Design Libraries:** `shadcn/ui` + `Tailwind CSS` + `Framer Motion` for animations + `Lucide React` for icons
- **Auth:** Supabase Auth (email/password + magic link)

---

## ARCHITECTURE

```
/
├── docker-compose.yml
├── frontend/                  # Next.js app
│   ├── Dockerfile
│   └── src/
│       ├── app/
│       ├── components/
│       └── lib/
└── backend/                   # FastAPI app
    ├── Dockerfile
    ├── main.py
    ├── routers/
    ├── models/
    └── services/
```

**Docker Compose** must spin up:
1. `frontend` container → port `3000`
2. `backend` container → port `8000`
3. No local DB container needed — use Supabase cloud free tier. Store the Supabase URL and anon key in `.env`.

---

## DATABASE SCHEMA (Supabase / PostgreSQL)

Create these tables via Supabase migrations or direct SQL:

### `profiles`
```sql
id (uuid, FK → auth.users.id, PK)
full_name (text)
avatar_url (text, nullable)
bio (text, nullable)
university (text, nullable)
major (text)                  -- e.g. "Computer Science", "Marketing", "Design", "Finance"
role_tags (text[])            -- e.g. ["developer", "backend", "python"]
achievements (jsonb)          -- array of {title, description, date, type: "olympiad"|"volunteer"|"project"}
skills (text[])
year_of_study (int)           -- 1-6
looking_for_squad (boolean, default true)
created_at (timestamptz)
updated_at (timestamptz)
```

### `squads`
```sql
id (uuid, PK)
name (text)
description (text)
focus_area (text)             -- e.g. "FinTech", "EdTech", "GreenTech", "Any"
max_members (int, default 5)
is_open (boolean)             -- accepting new members?
created_by (uuid, FK → profiles.id)
created_at (timestamptz)
```

### `squad_members`
```sql
id (uuid, PK)
squad_id (uuid, FK → squads.id)
user_id (uuid, FK → profiles.id)
role_in_squad (text)          -- "Tech Lead", "Business Strategist", "Designer", "Marketer", "Finance"
joined_at (timestamptz)
```

### `challenges`
```sql
id (uuid, PK)
squad_id (uuid, FK → squads.id)
title (text)
description (text)
difficulty (text)             -- "Beginner", "Intermediate", "Advanced"
category (text)               -- "Hackathon", "Business Case", "Product Sprint", "Pitch"
generated_by_ai (boolean)
ai_prompt_used (text, nullable)
deadline_days (int)
tasks (jsonb)                 -- array of {task_title, assigned_role, description}
status (text)                 -- "active", "completed", "archived"
created_at (timestamptz)
```

### `challenge_submissions`
```sql
id (uuid, PK)
challenge_id (uuid, FK → challenges.id)
squad_id (uuid, FK → squads.id)
submitted_by (uuid, FK → profiles.id)
content (text)
attachments (text[])
submitted_at (timestamptz)
```

---

## PAGES & FEATURES

### 1. `/` — Landing Page
- Hero section: animated tagline *"Don't navigate alone. Build your squad."*
- Show stats (total squads, students, challenges completed) fetched live from backend
- CTA buttons: "Create Profile" and "Find My Squad"
- Feature cards explaining the 3-step flow: Profile → Squad → Challenge
- Use Framer Motion for entrance animations (fade-up on scroll)

### 2. `/auth` — Authentication
- Supabase Auth UI (custom styled with shadcn). Email/password + magic link tabs.
- On first login, redirect to `/onboarding`

### 3. `/onboarding` — Profile Setup (multi-step wizard)
A 4-step animated wizard:
- **Step 1:** Basic info (name, university, major, year of study)
- **Step 2:** Role tags & skills (multi-select chips: Developer, Designer, Marketer, Business Analyst, Finance, Legal, Content Creator, Data Scientist)
- **Step 3:** Achievements (add cards: olympiad wins, volunteer experience, projects — each with title, description, date, type)
- **Step 4:** Squad preferences (focus area interest, open to joining existing squad or create new one)

On completion → save to `profiles` table → redirect to `/dashboard`

### 4. `/dashboard` — Main Hub
Split into two columns:
- **Left:** User's profile card (avatar, name, major, role tags, squad membership status)
- **Right:** Activity feed — current squad's active challenges, recent squad members joined, upcoming deadlines
- "Find Squad" and "Create Squad" prominent CTA buttons
- If user has no squad: show a full-width **"You're squadless"** banner with match suggestions

### 5. `/squads` — Squad Discovery
- Grid of squad cards with: squad name, focus area badge, member avatars (show their role), open/closed status, member count
- **Filter bar:** by focus area, by needed roles (e.g., "squads looking for a Developer"), by squad size
- **Smart Match button:** calls `GET /api/squads/match` which uses the user's profile (major, role_tags, skills) to return the top 3 best-fit squads (simple matching algorithm: score squads by missing roles that the user fills)
- Each squad card has "View" and "Join" buttons

### 6. `/squads/[id]` — Squad Detail Page
- Squad name, description, focus area
- **Members section:** cards for each member showing their avatar, name, university, role in squad, and top 3 skills
- **Role composition visual:** a horizontal bar or pie showing the mix (e.g., 1 Tech, 1 Business, 1 Design — use recharts or a simple CSS bar)
- **Active Challenges section:** list of challenges with status badges
- **Generate Challenge button** (only visible to squad members): opens a modal

### 7. `/squads/create` — Create Squad Page
- Form: squad name, description, focus area (dropdown), max members, which roles are needed (multi-select)
- On submit: `POST /api/squads` → redirect to the new squad's page

### 8. `/profile/[id]` — Public Profile Page
- Avatar, name, university, major, year
- Role tags as colorful badges
- Skills list
- Achievements section: timeline-style cards showing each achievement with type icon (trophy for olympiad, heart for volunteer, etc.)
- "Invite to Squad" button (if viewer is a squad leader and squad is open)

### 9. `/profile/edit` — Edit Own Profile
- Same layout as onboarding but pre-filled. Allow updating all fields including adding/removing achievements.

### 10. `/challenges/[id]` — Challenge Detail Page
- Challenge title, category badge, difficulty badge, deadline countdown timer
- AI-generated description rendered as markdown
- **Task breakdown table:** columns = Task, Assigned Role, Description — showing which squad member role should handle what
- Submission form: textarea + optional link attachments
- Submission history

---

## BACKEND API (FastAPI)

### Auth Middleware
All protected routes require `Authorization: Bearer <supabase_jwt>`. Validate using Supabase JWT secret. Create a `get_current_user` dependency.

### Routers

**`/api/profiles`**
- `GET /api/profiles/me` → return current user's profile
- `PUT /api/profiles/me` → update profile
- `GET /api/profiles/{user_id}` → public profile

**`/api/squads`**
- `GET /api/squads` → list squads (supports query params: `focus_area`, `needs_role`, `open_only`)
- `POST /api/squads` → create squad (creator auto-added as first member)
- `GET /api/squads/{squad_id}` → squad detail with members
- `POST /api/squads/{squad_id}/join` → join a squad (validates: squad is open, user not already in a squad with same focus, adds member)
- `GET /api/squads/match` → returns top 3 squads matched to current user's profile

**`/api/challenges`**
- `POST /api/challenges/generate` → **AI challenge generation endpoint** (see AI section below)
- `GET /api/challenges/{challenge_id}` → challenge detail
- `POST /api/challenges/{challenge_id}/submit` → submit work
- `GET /api/squads/{squad_id}/challenges` → all challenges for a squad

**`/api/stats`**
- `GET /api/stats` → returns `{total_squads, total_students, total_challenges_completed}` for landing page

---

## AI CHALLENGE GENERATION (Core Feature)

**Model:** `gemini-2.0-flash` via the `google-generativeai` Python SDK.

**Install:** `pip install google-generativeai`

**Initialization in backend:**
```python
import google.generativeai as genai
import os

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-2.0-flash")
```

**Endpoint:** `POST /api/challenges/generate`

**Request body:**
```json
{
  "squad_id": "uuid",
  "difficulty": "Beginner|Intermediate|Advanced",
  "category": "Hackathon|Business Case|Product Sprint|Pitch"
}
```

**Backend logic:**
1. Fetch the squad's members and their profiles (roles, skills, majors, achievements)
2. Build the prompt for Gemini. Use `generation_config` to enforce JSON output:

```python
generation_config = genai.GenerationConfig(
    response_mime_type="application/json"
)
```

3. Build a prompt string that includes:
   - A system instruction: *"You are an AI challenge coach for a student squad. Generate a realistic, industry-relevant challenge tailored to this squad's composition. The challenge must require genuine collaboration between all roles present. Return ONLY valid JSON matching the schema below, with no extra text."*
   - Squad focus area
   - Each member's role, major, skills (formatted as a list)
   - Requested difficulty and category
   - The exact JSON schema the response must conform to:

```json
{
  "title": "string",
  "description": "string (3-4 paragraphs, inspiring and specific)",
  "tasks": [
    {
      "task_title": "string",
      "assigned_role": "string (must match one of the squad roles)",
      "description": "string"
    }
  ],
  "deadline_days": 7,
  "success_criteria": ["string", "string", "string"]
}
```

4. Call Gemini:

```python
response = model.generate_content(
    prompt,
    generation_config=generation_config
)
parsed = json.loads(response.text)
```

5. Save the parsed result to the `challenges` table and return it to the frontend.

**Frontend modal flow:**
- User clicks "Generate Challenge" on squad page
- Modal opens with difficulty selector (3 cards: Beginner/Intermediate/Advanced) and category selector
- Loading state shows animated AI "thinking" indicator with text *"Gemini is crafting your challenge..."*
- On success: challenge card appears on squad page with a "New" badge and confetti animation (use `canvas-confetti`)

---

## DESIGN SYSTEM

### Color Palette (use CSS variables in Tailwind config)
- Primary: `#6C63FF` (electric violet)
- Secondary: `#FF6584` (coral)
- Accent: `#43E97B` (mint green)
- Background dark: `#0F0F1A`
- Card background: `#1A1A2E`
- Text primary: `#F0F0FF`
- Text muted: `#8888AA`

### Component Style Rules
- All cards: `rounded-2xl`, subtle `border border-white/10`, `backdrop-blur-sm` glass effect, soft box shadow
- Buttons: primary = gradient `from-[#6C63FF] to-[#FF6584]`, hover scale `1.02`, transition `200ms`
- Badges (role tags, difficulty): pill shape, each role has a fixed color (Developer=blue, Designer=pink, Business=green, Finance=yellow, Marketing=orange)
- Avatars: always circular with a colored ring matching the user's primary role color
- Use Framer Motion `layoutId` for shared element transitions between squad card and squad detail page

### Animations
- Page transitions: fade + slide up (150ms)
- Card hover: `translateY(-4px)` + glow shadow
- Squad member join: spring animation entrance
- Challenge generation loading: pulsing gradient skeleton + typewriter text

---

## DOCKER SETUP

**`docker-compose.yml`** must define:
- `frontend` service: builds from `./frontend/Dockerfile`, port `3000:3000`, env vars passed from `.env`
- `backend` service: builds from `./backend/Dockerfile`, port `8000:8000`, env vars passed from `.env`
- Both services depend on each other via `depends_on` (frontend depends on backend)
- A shared `.env` file at root with:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Get your Gemini API key for free at:** https://aistudio.google.com/app/apikey

**`frontend/Dockerfile`:** multi-stage build (node:20-alpine → build → serve with `next start`)

**`backend/Dockerfile`:** python:3.11-slim, install deps from `requirements.txt`, run with `uvicorn main:app --host 0.0.0.0 --port 8000`

**`backend/requirements.txt`** must include:
```
fastapi
uvicorn
supabase
google-generativeai
python-jose
python-dotenv
pydantic
httpx
```

Include a `README.md` with exact setup steps:
1. Clone repo
2. Copy `.env.example` to `.env` and fill in Supabase + Gemini API keys
3. `docker compose up --build`
4. Visit `http://localhost:3000`

---

## SQUAD MATCHING ALGORITHM (Backend)

For `GET /api/squads/match`, implement this scoring logic:

1. Get current user's `role_tags`
2. For each open squad, calculate:
   - **Role gap score:** how many of the squad's needed roles does this user fill? (+3 per match)
   - **Focus area score:** does user's major align with squad's focus area? (+2 if yes)
   - **Size score:** squads with 2-3 members score higher than full or solo squads (+1)
3. Return top 3 squads sorted by score descending
4. Include a `match_reason` string in the response (e.g., *"This squad needs a Developer — that's you!"*)

---

## ADDITIONAL REQUIREMENTS

- **Responsive design:** fully mobile-friendly. On mobile, the squad discovery page collapses to a vertical card list with sticky filter bar.
- **Loading states:** every data-fetching component must show a skeleton loader (use shadcn `Skeleton`).
- **Error handling:** all API errors must show a toast notification (use shadcn `Sonner`).
- **Empty states:** every empty list (no squads found, no challenges yet) must show an illustrated empty state with a CTA — not just blank space.
- **SEO:** each page must have a proper `<title>` and `<meta description>` via Next.js `generateMetadata`.
- **Type safety:** define shared TypeScript interfaces in `frontend/src/types/index.ts` for all entities (Profile, Squad, Challenge, etc.) matching the DB schema exactly.
- **CORS:** FastAPI must allow origins `http://localhost:3000` in development.
- **Environment safety:** never expose `SUPABASE_SERVICE_ROLE_KEY` or `GEMINI_API_KEY` to the frontend. All AI and privileged DB calls go through the FastAPI backend only.

---

## DELIVERABLE CHECKLIST

The implementation is complete when:
- [ ] `docker compose up` starts everything with zero manual steps beyond filling `.env`
- [ ] A new user can register, complete onboarding, and land on dashboard in under 2 minutes
- [ ] A user can browse squads, filter by role need, and join one with one click
- [ ] A squad member can generate a Gemini-powered AI challenge and see role-specific tasks appear
- [ ] All pages are visually polished with animations, proper empty states, and loading skeletons
- [ ] The codebase has no hardcoded secrets and reads all config from environment variables
