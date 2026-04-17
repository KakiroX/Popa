from fastapi import APIRouter
from database import supabase

router = APIRouter()

@router.get("")
def get_stats():
    # In a real app, you would use COUNT queries.
    squads_res = supabase.table("squads").select("id", count="exact").execute()
    students_res = supabase.table("profiles").select("id", count="exact").execute()
    challenges_res = supabase.table("challenges").select("id", count="exact").eq("status", "completed").execute()
    
    return {
        "total_squads": squads_res.count if squads_res.count is not None else 0,
        "total_students": students_res.count if students_res.count is not None else 0,
        "total_challenges_completed": challenges_res.count if challenges_res.count is not None else 0
    }
