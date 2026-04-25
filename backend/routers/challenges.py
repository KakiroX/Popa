from fastapi import APIRouter, Depends, HTTPException
import json
from google import genai
from google.genai import types
from database import supabase
from config import GEMINI_API_KEY, GEMINI_MODEL
from dependencies import get_current_user
from models.schemas import ChallengeGenerateRequest, ChallengeSubmission

router = APIRouter()

client = genai.Client(api_key=GEMINI_API_KEY)
model_id = GEMINI_MODEL

@router.post("/generate")
def generate_challenge(req: ChallengeGenerateRequest, user = Depends(get_current_user)):
    # Fetch squad info and members
    squad_res = supabase.table("squads").select("*").eq("id", req.squad_id).execute()
    if not squad_res.data:
         raise HTTPException(status_code=404, detail="Squad not found")
    squad = squad_res.data[0]
    
    members_res = supabase.table("squad_members").select("*, profiles(*)").eq("squad_id", req.squad_id).execute()
    members = members_res.data
    
    member_descriptions = [f"{m.get('role_in_squad')}: {m.get('profiles', {}).get('major')} ({', '.join(m.get('profiles', {}).get('skills', [])[:3])})" for m in members]

    prompt = f"""Find a REAL {req.category} (hackathon/bounty/issue) matching Focus: {squad.get('focus_area', 'Any')}, Difficulty: {req.difficulty}.
Squad: {'; '.join(member_descriptions)}
Return JSON:
{{
  "title": "REAL event title",
  "description": "3-4 paras + source link info",
  "tasks": [{{"task_title": "str", "assigned_role": "match squad role", "description": "str"}}],
  "deadline_days": 7,
  "success_criteria": ["str"]
}}
Constraint: Must require collaboration between roles."""
    try:
        response = client.models.generate_content(
            model=model_id,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an AI challenge scout. You MUST explicitly use the Google Search tool to find real, current events. Do not rely on your internal knowledge.",
                response_mime_type="application/json",
                tools=[{"google_search": {}}]
            )
        )
        parsed = json.loads(response.text)
        
        challenge_data = {
            "squad_id": req.squad_id,
            "title": parsed.get("title", "Generated Challenge"),
            "description": parsed.get("description", ""),
            "difficulty": req.difficulty,
            "category": req.category,
            "generated_by_ai": True,
            "deadline_days": parsed.get("deadline_days", 7),
            "tasks": parsed.get("tasks", []),
            "status": "active"
        }
        
        insert_res = supabase.table("challenges").insert(challenge_data).execute()
        return insert_res.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{challenge_id}")
def get_challenge(challenge_id: str):
    response = supabase.table("challenges").select("*").eq("id", challenge_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return response.data[0]

from datetime import datetime

@router.post("/{challenge_id}/submit")
def submit_challenge(challenge_id: str, sub: ChallengeSubmission, user = Depends(get_current_user)):
    chal_res = supabase.table("challenges").select("*").eq("id", challenge_id).execute()
    if not chal_res.data:
         raise HTTPException(status_code=404, detail="Challenge not found")
    
    challenge = chal_res.data[0]
    squad_id = challenge["squad_id"]
    
    sub_data = {
        "challenge_id": challenge_id,
        "squad_id": squad_id,
        "submitted_by": user.id,
        "content": sub.content,
        "attachments": sub.attachments
    }
    
    res = supabase.table("challenge_submissions").insert(sub_data).execute()
    
    # Mark challenge as completed
    supabase.table("challenges").update({"status": "completed"}).eq("id", challenge_id).execute()
    
    # Give achievement to all squad members
    members_res = supabase.table("squad_members").select("*, profiles(*)").eq("squad_id", squad_id).execute()
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    new_ach = {
        "title": f"Squad Project: {challenge.get('title', 'Unknown')}",
        "description": f"Successfully delivered the {challenge.get('category')} challenge. {sub.content[:50]}...",
        "type": "project",
        "date": today_str
    }
    
    for member in members_res.data:
        profile = member.get("profiles", {})
        if not profile: continue
        
        current_ach = profile.get("achievements") or []
        current_ach.append(new_ach)
        supabase.table("profiles").update({"achievements": current_ach}).eq("id", profile["id"]).execute()
        
    return res.data[0]
