from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from dependencies import get_current_user
from models.schemas import JobMatch
from typing import List, Optional, Dict, Any
from services.matching_service import matching_service
import asyncio

router = APIRouter()

@router.get("/match", response_model=List[JobMatch])
async def get_job_matches(user = Depends(get_current_user)):
    # 1. Fetch User Profile
    prof_res = supabase.table("profiles").select("*").eq("id", user.id).execute()
    if not prof_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile = prof_res.data[0]
    
    user_skills = profile.get("skills", [])
    user_exp = profile.get("experience_level")
    user_track = profile.get("preferred_track")
    
    # 2. Fetch All Jobs
    jobs_res = supabase.table("jobs").select("*").execute()
    jobs = jobs_res.data
    
    recommendations = []
    
    for job in jobs:
        job_skills = job.get("required_skills", job.get("skills_required", []))
        job_exp = job.get("experience_level", "fresher")
        job_title = job.get("job_title", job.get("title", ""))
        
        skill_score = matching_service.calculate_skill_overlap(user_skills, job_skills)
        exp_score = matching_service.calculate_experience_alignment(user_exp, job_exp)
        track_score = matching_service.calculate_track_alignment(user_track, job_title)
        
        # Weighted average
        final_score = (skill_score * 0.6) + (exp_score * 0.2) + (track_score * 0.2)
        
        # Generate match explanation
        strengths = []
        improvements = []
        
        if skill_score > 70:
            strengths.append("Strong technical skill match")
        elif skill_score < 40:
            # Safe missing skills list
            missing = [s for s in job_skills if s.lower() not in [us.lower() for us in user_skills]]
            if missing:
                improvements.append("Consider learning: " + ", ".join(missing[:3]))
            
        if exp_score >= 80:
            strengths.append(f"Experience level ({user_exp or 'fresher'}) is well-aligned")
            
        if track_score == 100:
            strengths.append(f"Matches your preferred track: {user_track}")

        # Basic explanation for now, could be upgraded to AI in a separate turn if needed for performance
        # Or we can do it for top 3 matches only to save tokens/time
        match_explanation = f"This role is a {final_score:.1f}% match based on your profile."
        
        recommendations.append({
            "job": job,
            "match_score": final_score,
            "skill_overlap": skill_score,
            "experience_alignment": exp_score,
            "track_alignment": track_score,
            "match_explanation": match_explanation,
            "strengths": strengths,
            "improvement_areas": improvements
        })
        
    # Sort by match score descending
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    
    top_recommendations = recommendations[:10]
    
    # Enhance top 3 with AI explanations
    async def get_ai_expl(rec):
        rec["match_explanation"] = await matching_service.generate_ai_explanation(profile, rec["job"], rec["match_score"])

    # Run AI explanations in parallel for top 3
    tasks = [get_ai_expl(rec) for rec in top_recommendations[:3]]
    if tasks:
        await asyncio.gather(*tasks)
    
    return top_recommendations
