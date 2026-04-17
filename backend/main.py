from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import profiles, squads, challenges, stats

app = FastAPI(title="Squad Navigator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
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
