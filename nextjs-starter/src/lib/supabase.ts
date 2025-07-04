import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types для базы данных
export interface Element {
  id: string;
  name: string;
  description: string;
  color_code: string;
  image_url: string;
}

export interface Mission {
  id: string;
  element_id: string;
  name: string;
  description: string;
  order: number;
  audio_url: string | null;
}

export interface MissionProgress {
  id: string;
  user_id: number;
  mission_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
}

export interface Artifact {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
} 