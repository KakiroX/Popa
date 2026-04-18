import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import profiles, squads, challenges, stats

app = FastAPI(title="Squad Navigator API")

# Allow dynamic CORS based on environment variables
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Clean up URLs (remove trailing slashes, spaces) to prevent CORS matching issues
if frontend_url == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [url.strip().rstrip("/") for url in frontend_url.split(",") if url.strip()]
    # Always allow localhost for local development just in case
    if "http://localhost:3000" not in allowed_origins:
        allowed_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if frontend_url != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
app.include_router(squads.router, prefix="/api/squads", tags=["Squads"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
