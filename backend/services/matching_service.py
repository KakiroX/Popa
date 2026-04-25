from typing import List, Optional, Dict, Any
import google.genai as genai
from google.genai import types
from config import GEMINI_API_KEY, GEMINI_MODEL

class MatchingService:
    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model_id = GEMINI_MODEL

    def calculate_skill_overlap(self, user_skills: List[str], job_skills: List[str]) -> float:
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

    def calculate_experience_alignment(self, user_exp: Optional[str], job_exp: str) -> float:
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

    def calculate_track_alignment(self, user_track: Optional[str], job_title: str) -> float:
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

    async def generate_ai_explanation(
        self,
        user_profile: Dict[str, Any],
        job: Dict[str, Any],
        match_score: float
    ) -> str:
        prompt = f"""
        You are a career advisor. Analyze the match between this candidate and job.

        Candidate:
        - Skills: {", ".join(user_profile.get('skills', []))}
        - Experience: {user_profile.get('experience_level', 'Not specified')}
        - Track: {user_profile.get('preferred_track', 'Not specified')}

        Job:
        - Title: {job.get('job_title', job.get('title'))}
        - Required Skills: {", ".join(job.get('required_skills', job.get('skills_required', [])))}
        - Experience Level: {job.get('experience_level')}
        - Description: {job.get('description', '')[:500]}...

        Match Score: {match_score:.1f}%

        Provide a concise, professional explanation (2 sentences) of why this is a match and what the candidate might need to improve.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            return f"This role is a {match_score:.1f}% match based on your skills and experience."

    def calculate_squad_match(
        self, 
        user_profile: Dict[str, Any], 
        squad: Dict[str, Any], 
        squad_members: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        score = 0
        reasons = []
        
        # 1. Role gap score: (+3 per match)
        needed_roles = squad.get("needed_roles", [])
        user_roles = user_profile.get("role_tags", [])
        
        if needed_roles and user_roles:
            matches = set([r.lower() for r in needed_roles]).intersection(set([r.lower() for r in user_roles]))
            if matches:
                score += 3 * len(matches)
                reasons.append(f"Matches needed roles: {', '.join(list(matches))}")
            
        # 2. Focus area score: (+2 if major aligns with focus area)
        user_major = user_profile.get("major", "").lower()
        squad_focus = squad.get("focus_area", "").lower()
        if user_major and squad_focus and user_major == squad_focus:
            score += 2
            reasons.append(f"Aligns with your major: {squad.get('focus_area')}")
            
        # 3. Size score: (+1 if 2-3 members)
        member_count = len(squad_members)
        if 2 <= member_count <= 3:
            score += 1
            reasons.append("Active squad size (2-3 members)")
            
        return {
            "score": score,
            "match_reason": ". ".join(reasons) if reasons else "Generic match based on profile"
        }

matching_service = MatchingService()
