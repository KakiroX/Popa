from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from dependencies import get_current_user
from models.schemas import ProfileUpdate, ProfileResponse
from google import genai
from google.genai import types
from config import GEMINI_API_KEY

router = APIRouter()
client = genai.Client(api_key=GEMINI_API_KEY)
model_id = "gemini-3-flash-preview"

@router.get("/me/career-advice")
def get_career_advice(user = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = response.data[0]
    
    achievements = profile.get("achievements") or []
    ach_text = ""
    for idx, ach in enumerate(achievements):
        ach_text += f"{idx+1}. {ach.get('title')} ({ach.get('type')}): {ach.get('description')}\n"
        
    if not ach_text:
        ach_text = "No achievements listed yet."
        
    prompt = f"""You are an expert career advisor AI. 
The user's major is {profile.get('major', 'Unknown')}.
Their skills are: {', '.join(profile.get('skills') or [])}.
Their achievements and projects are:
{ach_text}

Based ONLY on this specific profile and these specific projects, suggest 3 specific, real-world companies, startup accelerators, or internship programs they should apply to right now. 
Briefly explain WHY they are a strong fit. Format your answer nicely in Markdown."""

    try:
        config = types.GenerateContentConfig(
            system_instruction="You are an expert career advisor. Use the Google Search tool to find active, real-world opportunities.",
            tools=[{"google_search": {}}]
        )
        ai_response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=config
        )
        return {"advice": ai_response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate advice: {str(e)}")

@router.get("/me")
def get_my_profile(user = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data[0]

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
