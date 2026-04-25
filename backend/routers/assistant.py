from fastapi import APIRouter, Depends, HTTPException
import json
from google import genai
from google.genai import types
from database import supabase
from config import GEMINI_API_KEY, GEMINI_MODEL
from dependencies import get_current_user
from models.schemas import RoadmapGenerateRequest, CareerRoadmap, CVAnalyzeRequest, CareerPickRequest, CareerPickResponse
from typing import List

router = APIRouter()
client = genai.Client(api_key=GEMINI_API_KEY)
model_id = GEMINI_MODEL

@router.get("/health")
def assistant_health():
    return {"status": "assistant router ok"}

@router.post("/career-pick", response_model=CareerPickResponse)
def pick_career(req: CareerPickRequest, user = Depends(get_current_user)):
    # 1. Fetch Profile
    prof_res = supabase.table("profiles").select("*").eq("id", user.id).execute()
    profile = prof_res.data[0] if prof_res.data else {}
    
    # 2. Build Prompt
    prompt = f"""You are a brilliant Career Matchmaker. Suggest 3 specific career roles for this student.
    
    Student Interests:
    - Passions: {req.passions}
    - Favorite Subjects: {req.favorite_subjects}
    - Desired Impact: {req.desired_impact}
    
    Student Profile:
    - Current Major: {profile.get('major')}
    - Current Skills: {', '.join(profile.get('skills', []))}
    
    For each career role, estimate a "match_score" (0-100) based on their current skills vs requirements.
    Provide a compelling "why_it_fits" explanation.
    
    Return ONLY valid JSON matching this schema:
    {{
        "options": [
            {{
                "title": "Role Title",
                "description": "Short role overview",
                "match_score": 85,
                "why_it_fits": "..."
            }}
        ]
    }}
    """

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a career matching expert. Be realistic and encouraging.",
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Career Pick error: {str(e)}")

@router.post("/roadmap")
async def generate_roadmap(req: RoadmapGenerateRequest, user = Depends(get_current_user)):
    # 1. Fetch Profile
    prof_res = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not prof_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = prof_res.data[0]
    
    # 2. Build Prompt
    prompt = f"""You are an expert Career Mentor. Generate a highly detailed, personalized 6-phase career roadmap for a student to become a {req.target_role}.
    
    Student Profile:
    - Major: {profile.get('major')}
    - Skills: {', '.join(profile.get('skills', []))}
    - Experience Level: {profile.get('experience_level', 'fresher')}
    - Target Timeframe: {req.timeframe_months} months
    - Commitment: {req.learning_hours_per_week} hours/week

    You MUST use the Google Search tool to find REAL, up-to-date learning resources (courses, documentation, tutorials, certifications) for EACH phase.
    Include valid URLs for these resources.
    
    Return ONLY valid JSON matching this schema:
    {{
        "title": "Roadmap Title",
        "description": "Short overview",
        "phases": [
            {{
                "title": "Phase 1: ...",
                "description": "...",
                "resources": [
                    {{ "title": "Resource Name", "url": "https://..." }}
                ]
            }}
        ]
    }}
    """

    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are a professional career coach. You MUST use Google Search to find real learning resources and verify their URLs. Do not make up resources.",
                response_mime_type="application/json",
                tools=[{"google_search": {}}]
            )
        )
        parsed = json.loads(response.text)
        
        # 3. Save to DB
        roadmap_data = {
            "user_id": user.id,
            "title": parsed.get("title", f"{req.target_role} Roadmap"),
            "target_role": req.target_role,
            "roadmap_data": parsed, # Store full JSON
            "timeframe_months": req.timeframe_months,
            "learning_hours_per_week": req.learning_hours_per_week
        }
        
        insert_res = supabase.table("career_roadmaps").insert(roadmap_data).execute()
        return insert_res.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Roadmap error: {str(e)}")

@router.get("/roadmaps")
def list_my_roadmaps(user = Depends(get_current_user)):
    res = supabase.table("career_roadmaps").select("*").eq("user_id", user.id).order("created_at", desc=True).execute()
    return res.data

@router.get("/roadmaps/{roadmap_id}")
def get_roadmap(roadmap_id: str, user = Depends(get_current_user)):
    res = supabase.table("career_roadmaps").select("*").eq("id", roadmap_id).eq("user_id", user.id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return res.data[0]

@router.post("/cv-analyze")
def analyze_cv(req: CVAnalyzeRequest, user = Depends(get_current_user)):
    prompt = f"""You are an expert HR and Career Consultant. 
    Analyze the following raw text from a student's CV and extract their professional profile.
    
    CV TEXT:
    {req.raw_text}
    
    Return ONLY valid JSON matching this schema:
    {{
        "full_name": "string",
        "major": "string",
        "skills": ["string", "string"],
        "achievements": [
            {{ "title": "string", "description": "string", "date": "string", "type": "project|volunteer|olympiad" }}
        ],
        "suggested_experience_level": "fresher|junior|mid|senior",
        "suggested_career_track": "web_development|data|design|marketing|business"
    }}
    """
    
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an expert CV parser. Extract information accurately. If a field is missing, provide a best guess or empty list.",
                response_mime_type="application/json"
            )
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CV Analysis error: {str(e)}")

@router.post("/cv-save")
def save_raw_cv(req: CVAnalyzeRequest, user = Depends(get_current_user)):
    try:
        supabase.table("profiles").update({"raw_cv_text": req.raw_text}).eq("id", user.id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save CV: {str(e)}")
