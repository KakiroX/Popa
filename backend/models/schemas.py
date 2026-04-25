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
