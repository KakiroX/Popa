from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from dependencies import get_current_user
from models.schemas import ProfileUpdate, ProfileResponse, ChatRequest
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL

router = APIRouter()
client = genai.Client(api_key=GEMINI_API_KEY)
@router.post("/chat")
def chat_with_helper(req: ChatRequest, user = Depends(get_current_user)):
    response = supabase.table("profiles").select("major,skills,achievements").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = response.data[0]
    
    achievements = profile.get("achievements") or []
    ach_titles = ", ".join(a.get("title", "") for a in achievements[:2]) or "None"
    
    skills = profile.get('skills') or []
    skills_text = ", ".join(skills[:5])

    system_instruction = f"""You are Squadie, a concise student career mentor.
Student: major={profile.get('major','Unknown')}, skills=[{skills_text}], achievements=[{ach_titles}].
Rules: Be brief (max 3 short paragraphs). Be actionable. Suggest skill gaps and projects when relevant."""

    try:
        config_ai = types.GenerateContentConfig(
            system_instruction=system_instruction,
        )
        ai_response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=req.content,
            config=config_ai
        )
        return {"response": ai_response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Assistant error: {str(e)}")

@router.get("/me/career-advice")
def get_career_advice(user = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = response.data[0]
    
    achievements = profile.get("achievements") or []
    ach_text = ""
    # Extremely limited achievements for advice
    for ach in achievements[:2]:
        ach_text += f"- {ach.get('title')}\n"
        
    prompt = f"Major: {profile.get('major')}. Skills: {', '.join((profile.get('skills') or [])[:5])}. Achievements: {ach_text}. Suggest 3 real companies/programs. 1 sentence each. BE BRIEF."

    try:
        config_ai = types.GenerateContentConfig(
            system_instruction="You are a concise career advisor. MAX 100 words total."
        )
        ai_response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=config_ai
        )
        return {"advice": ai_response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate advice: {str(e)}")

@router.get("/me")
def get_my_profile(user = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = response.data[0]
    
    # Check for squad membership
    squad_member_res = supabase.table("squad_members").select("squad_id").eq("user_id", user.id).execute()
    if squad_member_res.data:
        profile["squad_id"] = squad_member_res.data[0]["squad_id"]
    else:
        profile["squad_id"] = None
        
    return profile

@router.put("/me")
def update_my_profile(profile: ProfileUpdate, user = Depends(get_current_user)):
    data = profile.dict()
    data["id"] = user.id
    
    # Ensure lists are passed as-is to Supabase array columns
    if not isinstance(data.get("role_tags"), list):
        data["role_tags"] = []
    if not isinstance(data.get("skills"), list):
        data["skills"] = []
    if not isinstance(data.get("achievements"), list):
        data["achievements"] = []
        
    try:
        response = supabase.table("profiles").upsert(data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@router.get("/{user_id}")
def get_profile(user_id: str):
    response = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data[0]
