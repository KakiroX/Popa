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
    response = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = response.data[0]
    
    # Fetch active roadmap goal
    roadmaps_res = supabase.table("career_roadmaps").select("target_role").eq("user_id", user.id).order("created_at", desc=True).limit(1).execute()
    active_goal = roadmaps_res.data[0].get("target_role") if roadmaps_res.data else "not yet set"
    
    achievements = profile.get("achievements") or []
    ach_text = ""
    for ach in achievements[:3]:
        title = ach.get('title', 'Project')
        desc = ach.get('description', '')
        short_desc = (desc[:60] + '..') if len(desc) > 60 else desc
        ach_text += f"- {title}: {short_desc}\n"
        
    skills = profile.get('skills') or []
    skills_text = ", ".join(skills[:10])

    system_instruction = f"""You are 'Squadie', a brilliant and supportive career mentor for students. 
Current Student Profile:
- Major: {profile.get('major', 'Unknown')}
- Current Skills: {skills_text}
- Top Achievements: 
{ach_text if ach_text else "None listed yet."}
- Primary Career Goal: {active_goal}

Your core mission:
1. Provide specific, actionable skill gap insights. If they have a goal, tell them what skills they are missing based on industry standards.
2. Suggest relevant squads or projects they should join.
3. Be encouraging but realistic.
4. Keep responses concise (under 3-4 short paragraphs).
5. Use Google Search to find specific internship trends or new technologies if relevant.

If the user asks 'how do I become a [role]', analyze their current skills against that role and list the top 3 gaps."""

    try:
        config_ai = types.GenerateContentConfig(
            system_instruction=system_instruction,
            tools=[{"google_search": {}}]
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
