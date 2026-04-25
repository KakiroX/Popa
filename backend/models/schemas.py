from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class Achievement(BaseModel):
    title: str
    description: str
    date: str
    type: str # "olympiad", "volunteer", "project"

class ProfileUpdate(BaseModel):
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    university: Optional[str] = None
    major: str
    role_tags: List[str]
    achievements: List[Achievement] = []
    skills: List[str]
    year_of_study: int
    looking_for_squad: bool = True
    experience_level: Optional[str] = None # fresher, junior, mid, senior
    preferred_track: Optional[str] = None # web_development, data, design, marketing, business

class ProfileResponse(ProfileUpdate):
    id: str
    created_at: datetime
    updated_at: datetime

class SquadCreate(BaseModel):
    name: str
    description: str
    focus_area: str
    max_members: int = 5
    needed_roles: List[str] = []

class SquadResponse(BaseModel):
    id: str
    name: str
    description: str
    focus_area: str
    max_members: int
    is_open: bool
    created_by: str
    created_at: datetime
    members: Optional[List[Dict[str, Any]]] = []

class ChallengeGenerateRequest(BaseModel):
    squad_id: str
    difficulty: str
    category: str

class ChallengeTask(BaseModel):
    task_title: str
    assigned_role: str
    description: str

class ChallengeResponse(BaseModel):
    id: str
    squad_id: str
    title: str
    description: str
    difficulty: str
    category: str
    generated_by_ai: bool
    deadline_days: int
    tasks: List[ChallengeTask]
    status: str
    created_at: datetime
    success_criteria: Optional[List[str]] = []

class ChallengeSubmission(BaseModel):
    content: str
    attachments: List[str] = []

class MessageCreate(BaseModel):
    content: str

class ChatRequest(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    squad_id: str
    user_id: Optional[str] = None
    is_ai: bool
    content: str
    created_at: datetime
    profiles: Optional[Dict[str, Any]] = None

# --- Career Models ---

class Job(BaseModel):
    id: str
    title: str
    company: str
    description: str
    requirements: Optional[str] = None
    skills_required: List[str]
    experience_level: str # fresher, junior, mid
    career_track: str # web_development, data, design, marketing
    remote: bool = False
    salary_range: Optional[str] = None
    posted_at: datetime

class JobMatch(BaseModel):
    job: Dict[str, Any]
    match_score: float
    skill_overlap: float
    experience_alignment: float
    track_alignment: float
    match_explanation: str
    strengths: List[str]
    improvement_areas: List[str] = []

class RoadmapStep(BaseModel):
    title: str
    description: str
    resources: List[Dict[str, str]] = [] # {title, url}

class RoadmapGenerateRequest(BaseModel):
    target_role: str
    timeframe_months: int = 6
    learning_hours_per_week: int = 10

class CVAnalyzeRequest(BaseModel):
    raw_text: str

class CareerRoadmap(BaseModel):
    id: str
    user_id: str
    title: str
    description: str
    steps: List[RoadmapStep]
    created_at: datetime

class LearningResource(BaseModel):
    id: str
    title: str
    url: str
    type: str # video, course, article
    skill_tag: str
