import { createClient } from '@/utils/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthToken() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

export const api = {
  profiles: {
    getMe: () => apiFetch('/api/profiles/me'),
    getById: (id: string) => apiFetch(`/api/profiles/${id}`),
    updateMe: (data: any) => apiFetch('/api/profiles/me', { method: 'PUT', body: JSON.stringify(data) }),
  },
  squads: {
    list: (params?: { focus_area?: string; open_only?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.focus_area && params.focus_area !== 'all') query.append('focus_area', params.focus_area);
      if (params?.open_only) query.append('open_only', 'true');
      const queryString = query.toString();
      return apiFetch(`/api/squads${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id: string) => apiFetch(`/api/squads/${id}`),
    create: (data: any) => apiFetch('/api/squads', { method: 'POST', body: JSON.stringify(data) }),
    join: (id: string, role: string) => apiFetch(`/api/squads/${id}/join?role_in_squad=${encodeURIComponent(role)}`, { method: 'POST' }),
    match: () => apiFetch('/api/squads/match'),
    getMessages: (id: string) => apiFetch(`/api/squads/${id}/messages`),
    sendMessage: (id: string, content: string) => apiFetch(`/api/squads/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  },
  challenges: {
    generate: (data: { squad_id: string; difficulty: string; category: string }) => 
      apiFetch('/api/challenges/generate', { method: 'POST', body: JSON.stringify(data) }),
    getById: (id: string) => apiFetch(`/api/challenges/${id}`),
    submit: (id: string, data: any) => apiFetch(`/api/challenges/${id}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  },
  stats: {
    get: () => apiFetch('/api/stats'),
  }
};

