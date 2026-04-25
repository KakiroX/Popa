-- Career Bridge Features Port for Squad Navigator

-- 1. Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'experience_level') THEN
        CREATE TYPE experience_level AS ENUM ('fresher', 'junior', 'mid', 'senior');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'career_track') THEN
        CREATE TYPE career_track AS ENUM ('web_development', 'data', 'design', 'marketing', 'business');
    END IF;
END $$;

-- 2. Update Profiles with Career Fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS education_level TEXT,
ADD COLUMN IF NOT EXISTS experience_level experience_level,
ADD COLUMN IF NOT EXISTS preferred_track career_track,
ADD COLUMN IF NOT EXISTS target_roles TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS raw_cv_text TEXT;

-- 3. Jobs Table (Real-world opportunities)
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    job_title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    job_description TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    experience_level experience_level NOT NULL,
    salary_min INTEGER,
    salary_max INTEGER,
    responsibilities TEXT[] DEFAULT '{}',
    requirements TEXT[] DEFAULT '{}',
    benefits TEXT[] DEFAULT '{}',
    url TEXT,
    source TEXT DEFAULT 'CareerBridge',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Learning Resources
CREATE TABLE IF NOT EXISTS learning_resources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    related_skills TEXT[] NOT NULL DEFAULT '{}',
    is_free BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Career Roadmaps (AI Generated)
CREATE TABLE IF NOT EXISTS career_roadmaps (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_role TEXT NOT NULL,
    roadmap_data JSONB NOT NULL,
    timeframe_months INTEGER DEFAULT 6,
    learning_hours_per_week INTEGER DEFAULT 10,
    progress_percentage INTEGER DEFAULT 0,
    completed_phases INTEGER[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Application Tracking
CREATE TABLE IF NOT EXISTS application_tracking (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'applied', -- 'applied', 'interviewing', 'offered', 'rejected'
    notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- 7. User Progress (Learning)
CREATE TABLE IF NOT EXISTS user_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
    completion_percentage INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, resource_id)
);
