from fastapi import APIRouter, Depends, HTTPException
from routers.assistant import analyze_cv, generate_roadmap, list_my_roadmaps, get_roadmap
from routers.profiles import chat_with_helper
from dependencies import get_current_user
from models.schemas import CVAnalyzeRequest, RoadmapGenerateRequest, ChatRequest, ProfileUpdate
from database import supabase
from typing import Any, Dict

router = APIRouter()

@router.post("/extract-skills")
async def extract_skills(req: Dict[str, Any], user = Depends(get_current_user)):
    # Legacy endpoint expects "cv_text" and "update_profile"
    cv_text = req.get("cv_text", "")
    update_profile = req.get("update_profile", False)
    
    cv_req = CVAnalyzeRequest(raw_text=cv_text)
    analysis = analyze_cv(cv_req, user)
    
    if update_profile:
        # Fetch current profile to merge
        prof_res = supabase.table("profiles").select("*").eq("id", user.id).execute()
        if prof_res.data:
            profile = prof_res.data[0]
            # Update profile with extracted info
            profile["full_name"] = analysis.get("full_name") or profile.get("full_name")
            profile["major"] = analysis.get("major") or profile.get("major")
            profile["skills"] = list(set((profile.get("skills") or []) + (analysis.get("skills") or [])))
            profile["experience_level"] = analysis.get("suggested_experience_level") or profile.get("experience_level")
            profile["preferred_track"] = analysis.get("suggested_career_track") or profile.get("preferred_track")
            
            supabase.table("profiles").upsert(profile).execute()
            
    return analysis

@router.post("/roadmap")
async def ai_roadmap(req: RoadmapGenerateRequest, user = Depends(get_current_user)):
    return generate_roadmap(req, user)

@router.get("/roadmaps")
async def ai_list_roadmaps(user = Depends(get_current_user)):
    return list_my_roadmaps(user)

@router.get("/roadmaps/{roadmap_id}")
async def ai_get_roadmap(roadmap_id: str, user = Depends(get_current_user)):
    return get_roadmap(roadmap_id, user)

@router.post("/ask-mentor")
async def ai_ask_mentor(req: ChatRequest, user = Depends(get_current_user)):
    # Legacy uses "question", mine uses "content"
    if "question" in req.__dict__:
        req.content = req.__dict__["question"]
    return chat_with_helper(req, user)
