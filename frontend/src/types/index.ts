export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  university: string | null;
  major: string;
  role_tags: string[];
  achievements: Achievement[];
  skills: string[];
  year_of_study: number;
  looking_for_squad: boolean;
  squad_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  type: 'olympiad' | 'volunteer' | 'project';
}

export interface Squad {
  id: string;
  name: string;
  description: string;
  focus_area: string;
  max_members: number;
  is_open: boolean;
  created_by: string;
  created_at: string;
  members?: SquadMember[];
}

export interface SquadMember {
  id: string;
  squad_id: string;
  user_id: string;
  role_in_squad: string;
  joined_at: string;
  profile?: Profile;
}

export interface Challenge {
  id: string;
  squad_id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Hackathon' | 'Business Case' | 'Product Sprint' | 'Pitch';
  generated_by_ai: boolean;
  ai_prompt_used: string | null;
  deadline_days: number;
  tasks: Task[];
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

export interface Task {
  task_title: string;
  assigned_role: string;
  description: string;
}

export interface ChallengeSubmission {
  id: string;
  challenge_id: string;
  squad_id: string;
  submitted_by: string;
  content: string;
  attachments: string[];
  submitted_at: string;
}

export interface Message {
  id: string;
  squad_id: string;
  user_id: string | null;
  is_ai: boolean;
  content: string;
  created_at: string;
  profiles?: Profile;
}

