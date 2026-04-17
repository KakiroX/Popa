from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Using the service role key to bypass RLS on backend if needed, 
# or we can pass user's token directly to supabase.
# For standard operations:
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
