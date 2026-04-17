-- Run this in your Supabase SQL Editor

-- 1. Profiles Table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  university TEXT,
  major TEXT,
  role_tags TEXT[],
  achievements JSONB,
  skills TEXT[],
  year_of_study INT,
  looking_for_squad BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Squads Table
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  focus_area TEXT,
  max_members INT DEFAULT 5,
  is_open BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Squad Members Table
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role_in_squad TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- 4. Challenges Table
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT,
  category TEXT,
  generated_by_ai BOOLEAN DEFAULT FALSE,
  ai_prompt_used TEXT,
  deadline_days INT DEFAULT 7,
  tasks JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  success_criteria JSONB
);

-- 5. Challenge Submissions Table
CREATE TABLE challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES profiles(id),
  content TEXT,
  attachments TEXT[],
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Enable RLS (Row Level Security) and add basic policies.
-- For this prototype, RLS is ignored as backend uses Service Role Key,
-- but if using Supabase client on frontend, RLS policies are needed.
