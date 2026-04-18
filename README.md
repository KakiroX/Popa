# EduTech Squad Navigator

Build a full-stack web application called **"Squad Navigator"** — a platform that groups students from different disciplines into multidisciplinary teams and assigns them AI-generated real-world challenges.

## Setup Instructions

1. Clone the repository.
2. Copy `.env.example` to `.env` and fill in Supabase + Gemini API keys:
   ```bash
   cp .env.example .env
   ```
3. Run the application using Docker Compose:
   ```bash
   docker compose up --build
   ```
4. Visit `http://localhost:3000` to see the application.

## Deployment

This application is configured for easy deployment across **Vercel** (Frontend) and **Render** (Backend).

### 1. Deploying the Backend to Render

You can easily deploy the backend via Render's Blueprint feature.
1. Create a [Render](https://render.com/) account.
2. In the Render Dashboard, click **New +** > **Blueprint**.
3. Connect your GitHub repository. Render will automatically detect the `render.yaml` configuration at the root of the project.
4. Render will prompt you to enter the environment variables (e.g., `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, etc.).
5. Once deployed, note your Render Web Service URL (e.g., `https://poooop-backend.onrender.com`).

### 2. Deploying the Frontend to Vercel

The frontend is a Next.js application that can be deployed instantly using Vercel.
1. Create a [Vercel](https://vercel.com/) account.
2. Click **Add New...** > **Project** and import your GitHub repository.
3. Set the **Framework Preset** to **Next.js**.
4. Set the **Root Directory** to `frontend`.
5. Under **Environment Variables**, add the following:
   - `NEXT_PUBLIC_API_URL`: Your Render Web Service URL from Step 1.
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
6. Click **Deploy**.

**Important CORS Configuration:** After deploying your Vercel frontend, go back to your Render Dashboard for the backend service and update the `FRONTEND_URL` environment variable with your new Vercel domain (e.g., `https://your-vercel-app.vercel.app`) to ensure CORS operates correctly.
