import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import profiles, squads, challenges, stats, jobs, assistant, ai

app = FastAPI(title="Squad Navigator API")

# Allow dynamic CORS based on environment variables
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Clean up URLs and provide sensible defaults
if frontend_url == "*":
    allowed_origins = ["*"]
else:
    # Split by comma and clean up
    origins = [url.strip().rstrip("/") for url in frontend_url.split(",") if url.strip()]
    
    # Ensure common dev and potential production origins are included if not "*"
    # This helps if the user forgot to update their FRONTEND_URL environment variable
    defaults = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    for d in defaults:
        if d not in origins:
            origins.append(d)
    
    allowed_origins = origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True if frontend_url != "*" else False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.include_router(profiles.router, prefix="/api/profiles", tags=["Profiles"])
app.include_router(squads.router, prefix="/api/squads", tags=["Squads"])
app.include_router(challenges.router, prefix="/api/challenges", tags=["Challenges"])
app.include_router(stats.router, prefix="/api/stats", tags=["Stats"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
app.include_router(assistant.router, prefix="/api/assistant", tags=["Assistant"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Legacy"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
