from fastapi import APIRouter, Depends, HTTPException
from database import supabase
from dependencies import get_current_user
from models.schemas import JobMatch
from typing import List, Optional, Dict, Any
import math

router = APIRouter()

def calculate_skill_overlap(user_skills: List[str], job_skills: List[str]) -> float:
    if not job_skills:
        return 100.0
    
    user_skills_set = {s.lower() for s in user_skills}
    job_skills_set = {s.lower() for s in job_skills}
    
    matched = len(user_skills_set.intersection(job_skills_set))
    overlap = (matched / len(job_skills_set)) * 100.0
    
    # Bonus for extra skills
    bonus = 0.0
    if len(user_skills) > len(job_skills):
        bonus = ((len(user_skills) - len(job_skills)) / len(job_skills)) * 10.0
        
    return min(100.0, overlap + bonus)

def calculate_experience_alignment(user_exp: Optional[str], job_exp: str) -> float:
    if not user_exp:
        return 50.0
    
    user_exp = user_exp.lower()
    job_exp = job_exp.lower()
    
    if user_exp == job_exp:
        return 100.0
    
    hierarchy = {"fresher": 0, "junior": 1, "mid": 2, "senior": 3}
    user_val = hierarchy.get(user_exp, 0)
    job_val = hierarchy.get(job_exp, 0)
    
    diff = user_val - job_val
    if diff == 1: # Overqualified by 1 level
        return 80.0
    if diff == -1: # Underqualified by 1 level
        return 70.0
    if diff > 1: # Highly overqualified
        return 50.0
    if diff < -1: # Highly underqualified
        return 30.0
        
    return 50.0

def calculate_track_alignment(user_track: Optional[str], job_title: str) -> float:
    if not user_track:
        return 50.0
    
    user_track = user_track.lower()
    title_lower = job_title.lower()
    
    tracks = {
        "web_development": ["frontend", "backend", "full stack", "web", "react", "node", "javascript", "typescript", "html", "css"],
        "data": ["data", "analyst", "scientist", "ml", "machine learning", "python", "sql", "ai"],
        "design": ["designer", "ui", "ux", "graphic", "figma", "product design"],
        "marketing": ["marketing", "seo", "content", "social media", "growth"],
        "business": ["business", "analyst", "product manager", "pm", "strategy", "finance"]
    }
    
    keywords = tracks.get(user_track, [])
    for kw in keywords:
        if kw in title_lower:
            return 100.0
            
    return 40.0

@router.get("/match", response_model=List[JobMatch])
def get_job_matches(user = Depends(get_current_user)):
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
        job_skills = job.get("required_skills", [])
        job_exp = job.get("experience_level", "fresher")
        job_title = job.get("job_title", "")
        
        skill_score = calculate_skill_overlap(user_skills, job_skills)
        exp_score = calculate_experience_alignment(user_exp, job_exp)
        track_score = calculate_track_alignment(user_track, job_title)
        
        # Weighted average
        final_score = (skill_score * 0.6) + (exp_score * 0.2) + (track_score * 0.2)
        
        # Generate match explanation
        strengths = []
        improvements = []
        
        if skill_score > 70:
            strengths.append("Strong technical skill match")
        elif skill_score < 40:
            improvements.append("Consider learning: " + ", ".join([s for s in job_skills if s.lower() not in [us.lower() for us in user_skills]][:3]))
            
        if exp_score >= 80:
            strengths.append(f"Experience level ({user_exp}) is well-aligned")
            
        if track_score == 100:
            strengths.append(f"Matches your preferred track: {user_track}")

        match_explanation = f"This role is a {final_score:.1f}% match based on your profile."
        if final_score > 80:
            match_explanation += " You are an excellent fit for this position!"
        elif final_score > 60:
            match_explanation += " You have a solid foundation for this role."
        else:
            match_explanation += " This could be a good stretch opportunity to build new skills."

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
    
    return recommendations[:10]
