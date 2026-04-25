from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from dependencies import get_current_user
from models.schemas import ProfileUpdate, ProfileResponse, ChatRequest
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL

router = APIRouter()
client = genai.Client(api_key=GEMINI_API_KEY)
model_id = GEMINI_MODEL

@router.post("/chat")
def chat_with_helper(req: ChatRequest, user = Depends(get_current_user)):
    response = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = response.data[0]
    
    achievements = profile.get("achievements") or []
    ach_text = ""
    for idx, ach in enumerate(achievements):
        ach_text += f"- {ach.get('title')} ({ach.get('type')}): {ach.get('description')} (Date: {ach.get('date')})\n"
        
    if not ach_text:
        ach_text = "No achievements listed yet."
        
    system_instruction = f"""You are 'Squadie', a personal university AI helper. 
Your goal is to help the student navigate their university life and career by leveraging their specific achievements and skills.

Student Profile:
- Name: {profile.get('full_name', 'Student')}
- Major: {profile.get('major', 'Unknown')}
- University: {profile.get('university', 'Unknown')}
- Skills: {', '.join(profile.get('skills') or [])}
- Year of Study: {profile.get('year_of_study', 'Unknown')}
- Experience Level: {profile.get('experience_level', 'Unknown')}
- Career Track: {profile.get('preferred_track', 'General')}

Achievements & Projects:
{ach_text}

When the student asks a question, always consider how their existing achievements and career track goals can help them.
Be encouraging, professional, and specific. Use the Google Search tool if they ask about external opportunities, competitions, or latest industry trends relevant to their major or target track."""

    try:
        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[{"google_search": {}}]
        )
        ai_response = client.models.generate_content(
            model=model_id,
            contents=req.content,
            config=config
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
    for idx, ach in enumerate(achievements):
        ach_text += f"{idx+1}. {ach.get('title')} ({ach.get('type')}): {ach.get('description')}\n"
        
    if not ach_text:
        ach_text = "No achievements listed yet."
        
    prompt = f"""User Major: {profile.get('major', 'Unknown')}
Skills: {', '.join(profile.get('skills') or [])}
Achievements:
{ach_text}

Suggest 3 specific companies, programs, or competitions. Be extremely concise. Use bullet points. 1 sentence per recommendation."""

    try:
        config = types.GenerateContentConfig(
            system_instruction="You are a concise career advisor. Use Google Search for real opportunities. BE CONCISE.",
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
