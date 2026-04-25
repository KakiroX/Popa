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
    
    member_descriptions = []
    roles = []
    for m in members:
        prof = m.get("profiles", {})
        role = m.get("role_in_squad", "Member")
        roles.append(role)
        skills = prof.get('skills', [])
        skills_text = ", ".join(skills[:5]) # Limit to top 5 skills
        member_descriptions.append(f"Role: {role}, Major: {prof.get('major', 'Unknown')}, Skills: {skills_text}")

    prompt = f"""You are an AI challenge scout for a student squad. DO NOT invent a fictional challenge. 
Instead, SEARCH THE INTERNET for a REAL, existing hackathon, open-source issue, business case competition, or startup bounty that fits this squad's focus area and skills.
Once you find a real-world challenge, adapt it into the JSON schema below. 
In the description, you MUST include the real name of the event/company and briefly explain where you found it online.

The challenge must require genuine collaboration between all roles present in the squad. 
Return ONLY valid JSON matching the schema below, with no extra text.

Squad Focus Area: {squad.get('focus_area', 'Any')}
Difficulty: {req.difficulty}
Category: {req.category}
Squad Members:
{chr(10).join(member_descriptions)}

Required JSON Schema:
{{
  "title": "string (Title of the REAL challenge/hackathon)",
  "description": "string (3-4 paragraphs, inspiring and specific, mentioning the real-world source and link context)",
  "tasks": [
    {{
      "task_title": "string",
      "assigned_role": "string (must match one of the squad roles)",
      "description": "string"
    }}
  ],
  "deadline_days": 7,
  "success_criteria": ["string", "string", "string"]
}}
"""
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
