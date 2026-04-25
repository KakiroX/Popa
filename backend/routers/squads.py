from fastapi import APIRouter, Depends, HTTPException, Query
from database import supabase
from dependencies import get_current_user
from models.schemas import SquadCreate, SquadResponse, MessageCreate
from typing import Optional, List, Dict, Any
from google import genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL
from services.matching_service import matching_service

router = APIRouter()

client = genai.Client(api_key=GEMINI_API_KEY)
model_id = GEMINI_MODEL

@router.get("")
def list_squads(focus_area: Optional[str] = None, open_only: bool = False):
    query = supabase.table("squads").select("*")
    if focus_area:
        query = query.eq("focus_area", focus_area)
    if open_only:
        query = query.eq("is_open", True)
    response = query.execute()
    return response.data

@router.post("")
def create_squad(squad: SquadCreate, user = Depends(get_current_user)):
    # Verify user has a profile first
    profile_check = supabase.table("profiles").select("id").eq("id", user.id).execute()
    if not profile_check.data:
        raise HTTPException(status_code=400, detail="You must complete onboarding to create a profile before making a squad.")

    squad_data = squad.dict()
    squad_data["created_by"] = user.id
    squad_data["is_open"] = True
    
    # Insert squad
    response = supabase.table("squads").insert(squad_data).execute()
    new_squad = response.data[0]
    
    # Add creator as member
    member_data = {
        "squad_id": new_squad["id"],
        "user_id": user.id,
        "role_in_squad": "Creator"
    }
    supabase.table("squad_members").insert(member_data).execute()
    
    # Update profile to not looking for squad
    supabase.table("profiles").update({"looking_for_squad": False}).eq("id", user.id).execute()
    
    return new_squad

@router.get("/match")
def match_squads(user = Depends(get_current_user)):
    # 1. Get user profile
    profile_res = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not profile_res.data:
        return []
    profile = profile_res.data[0]
    
    # 2. Get open squads
    squads_res = supabase.table("squads").select("*").eq("is_open", True).execute()
    squads = squads_res.data
    
    # 3. Get all squad members for size calculation
    # In a real app, we'd do this more efficiently (e.g., with a count query or join)
    members_res = supabase.table("squad_members").select("squad_id").execute()
    all_members = members_res.data
    
    # Group members by squad_id
    from collections import defaultdict
    squad_member_counts = defaultdict(list)
    for m in all_members:
        squad_member_counts[m["squad_id"]].append(m)
    
    # 4. Score squads
    scored_squads = []
    for s in squads:
        # Skip if user is already a member
        if any(m["user_id"] == user.id for m in squad_member_counts[s["id"]]):
            continue
            
        match_data = matching_service.calculate_squad_match(profile, s, squad_member_counts[s["id"]])
        scored_squads.append({
            "squad": s, 
            "score": match_data["score"], 
            "match_reason": match_data["match_reason"]
        })
        
    scored_squads.sort(key=lambda x: x["score"], reverse=True)
    return scored_squads[:3]

@router.get("/{squad_id}")
def get_squad(squad_id: str):
    response = supabase.table("squads").select("*").eq("id", squad_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Squad not found")
    squad = response.data[0]
    
    members_res = supabase.table("squad_members").select("*, profiles(*)").eq("squad_id", squad_id).execute()
    squad["members"] = members_res.data
    
    return squad

@router.post("/{squad_id}/join")
def join_squad(squad_id: str, role_in_squad: str, user = Depends(get_current_user)):
    # Check if open
    squad_res = supabase.table("squads").select("*").eq("id", squad_id).execute()
    if not squad_res.data or not squad_res.data[0].get("is_open"):
        raise HTTPException(status_code=400, detail="Squad not found or closed")

    # Check if user is already a member
    member_check = supabase.table("squad_members").select("*").eq("squad_id", squad_id).eq("user_id", user.id).execute()
    if member_check.data:
        raise HTTPException(status_code=400, detail="You are already a member of this squad")

    member_data = {
        "squad_id": squad_id,
        "user_id": user.id,
        "role_in_squad": role_in_squad
    }
    response = supabase.table("squad_members").insert(member_data).execute()
    
    # Update profile to not looking for squad
    supabase.table("profiles").update({"looking_for_squad": False}).eq("id", user.id).execute()
    
    return response.data[0]
@router.get("/{squad_id}/challenges")
def get_squad_challenges(squad_id: str):
    response = supabase.table("challenges").select("*").eq("squad_id", squad_id).order("created_at", desc=True).execute()
    return response.data

@router.get("/{squad_id}/messages")
def get_squad_messages(squad_id: str, user = Depends(get_current_user)):
    response = supabase.table("squad_messages").select("*, profiles(*)").eq("squad_id", squad_id).order("created_at", desc=True).limit(50).execute()
    return response.data

@router.post("/{squad_id}/messages")
def send_squad_message(squad_id: str, msg: MessageCreate, user = Depends(get_current_user)):
    # 1. Insert User Message
    user_msg_data = {
        "squad_id": squad_id,
        "user_id": user.id,
        "content": msg.content,
        "is_ai": False
    }
    user_msg_res = supabase.table("squad_messages").insert(user_msg_data).execute()
    
    response_messages = [user_msg_res.data[0]]

    content_strip = msg.content.strip()
    if content_strip.lower().startswith("/ai"):
        user_prompt = content_strip[3:].strip()
        
        # 1. Get Core Squad Focus only
        squad_res = supabase.table("squads").select("focus_area").eq("id", squad_id).execute()
        squad_focus = squad_res.data[0].get('focus_area') if squad_res.data else "General"
        
        ai_response_text = ""
        try:
            # Minimalist prompt, no history, no search
            config = types.GenerateContentConfig(
                system_instruction=f"You are the Squad AI Coach. Squad Focus: {squad_focus}. Answer the student's request concisely and professionally."
            )

            response = client.models.generate_content(
                model=model_id,
                contents=user_prompt,
                config=config
            )
            ai_response_text = response.text
                
        except Exception as e:
            ai_response_text = f"An error occurred while calling my brain: {str(e)}"
            
        # Insert AI Message
        ai_msg_data = {
            "squad_id": squad_id,
            "content": ai_response_text,
            "is_ai": True
        }
        ai_msg_res = supabase.table("squad_messages").insert(ai_msg_data).execute()
        response_messages.append(ai_msg_res.data[0])

    return response_messages
