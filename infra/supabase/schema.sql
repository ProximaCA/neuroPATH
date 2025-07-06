-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS user_artifacts CASCADE;
DROP TABLE IF EXISTS mission_progress CASCADE;
DROP TABLE IF EXISTS practices CASCADE;
DROP TABLE IF EXISTS artifacts CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS elements CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- User Table: Enhanced for Telegram Web App
create table users (
  id bigint primary key, -- Using Telegram user ID as the primary key
  first_name text not null,
  last_name text,
  username text,
  photo_url text, -- Telegram profile photo
  language_code text default 'ru',
  current_element_id uuid,
  light_balance integer default 0, -- СВЕТ currency
  level integer default 1,
  total_missions_completed integer default 0,
  total_meditation_minutes integer default 0,
  streak_days integer default 0,
  last_activity timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Elements Table: Stores elemental archetypes (Water, Fire, etc.)
create table elements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color_code text,
  image_url text,
  unlock_level integer default 1, -- Level required to unlock element
  total_missions integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Missions Table: Enhanced mission tracking
create table missions (
  id uuid primary key default gen_random_uuid(),
  element_id uuid references elements(id) on delete cascade not null,
  name text not null,
  description text,
  "order" int not null,
  audio_url text,
  duration_minutes integer default 5,
  light_reward integer default 10, -- СВЕТ reward for completion
  xp_reward integer default 50, -- Experience points
  unlock_condition text, -- JSON string for unlock conditions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mission Progress Table: Enhanced progress tracking
create table mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references users(id) on delete cascade not null,
  mission_id uuid references missions(id) on delete cascade not null,
  status text not null default 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_percentage integer default 0, -- 0-100
  current_step integer default 0, -- Current meditation step
  total_steps integer default 5, -- Total steps in meditation
  time_spent_seconds integer default 0, -- Total time spent
  attempts integer default 0, -- Number of attempts
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  last_activity timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, mission_id)
);

-- Practices Table: Stores meditation/practice tracks
create table practices (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) not null,
  title text not null,
  audio_url text,
  duration_seconds int,
  step_order integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Artifacts Table: Enhanced artifact system
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text,
  rarity text default 'common', -- 'common', 'rare', 'epic', 'legendary'
  element_id uuid references elements(id),
  mission_id uuid references missions(id), -- Which mission rewards this artifact
  light_value integer default 5, -- Value when traded
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Artifacts Table: Enhanced artifact tracking
create table user_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references users(id) not null,
  artifact_id uuid references artifacts(id) not null,
  acquired_at timestamp default now(),
  source text, -- 'mission_completion', 'gift', 'purchase'
  unique(user_id, artifact_id)
);

-- User Referrals Table: Track invited friends
create table user_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id bigint references users(id) not null,
  referred_user_id bigint references users(id) not null,
  referral_bonus_given boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(referrer_user_id, referred_user_id)
);

-- Friends Table: Social features
create table friends (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references users(id) not null,
  friend_id bigint references users(id) not null,
  status text default 'pending', -- 'pending', 'accepted', 'blocked'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

-- Light Transactions Table: Track СВЕТ transfers
create table light_transactions (
  id uuid primary key default gen_random_uuid(),
  from_user_id bigint references users(id),
  to_user_id bigint references users(id) not null,
  amount integer not null,
  transaction_type text not null, -- 'mission_reward', 'friend_gift', 'daily_bonus'
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Sessions Table: Track Telegram Web App sessions
create table user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references users(id) not null,
  session_data jsonb, -- Store Telegram WebApp init data
  ip_address inet,
  user_agent text,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  is_active boolean default true
);

-- Add foreign key constraint to users table after elements table is created
alter table users
add constraint fk_current_element
foreign key (current_element_id)
references elements(id);

-- Create indexes for better performance
CREATE INDEX idx_users_telegram_id ON users(id);
CREATE INDEX idx_mission_progress_user_id ON mission_progress(user_id);
CREATE INDEX idx_mission_progress_status ON mission_progress(status);
CREATE INDEX idx_user_artifacts_user_id ON user_artifacts(user_id);
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_light_transactions_user_id ON light_transactions(to_user_id);
CREATE INDEX idx_user_referrals_referrer ON user_referrals(referrer_user_id);
CREATE INDEX idx_user_referrals_referred ON user_referrals(referred_user_id);

-- Create function to update user level based on XP
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple level calculation: level = floor(total_missions_completed / 3) + 1
  NEW.level = GREATEST(1, FLOOR(NEW.total_missions_completed / 3.0) + 1);
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update user level
CREATE TRIGGER trigger_update_user_level
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_level();

-- Create function to handle mission completion
CREATE OR REPLACE FUNCTION complete_mission(
  p_user_id bigint,
  p_mission_id uuid
)
RETURNS json AS $$
DECLARE
  mission_record missions%ROWTYPE;
  artifact_record artifacts%ROWTYPE;
  user_record users%ROWTYPE;
  next_mission_record missions%ROWTYPE;
  result json;
BEGIN
  -- Get mission details
  SELECT * INTO mission_record FROM missions WHERE id = p_mission_id;
  SELECT * INTO user_record FROM users WHERE id = p_user_id;
  
  -- Check if mission is already completed
  IF EXISTS (
    SELECT 1 FROM mission_progress 
    WHERE user_id = p_user_id AND mission_id = p_mission_id AND status = 'completed'
  ) THEN
    RETURN json_build_object('error', 'Mission already completed');
  END IF;
  
  -- Update mission progress
  UPDATE mission_progress 
  SET 
    status = 'completed',
    progress_percentage = 100,
    completed_at = timezone('utc'::text, now()),
    last_activity = timezone('utc'::text, now())
  WHERE user_id = p_user_id AND mission_id = p_mission_id;
  
  -- Update user stats (+10 СВЕТА за каждый урок)
  UPDATE users 
  SET 
    total_missions_completed = total_missions_completed + 1,
    total_meditation_minutes = total_meditation_minutes + mission_record.duration_minutes,
    light_balance = light_balance + 10, -- Fixed reward of 10 light per mission
    last_activity = timezone('utc'::text, now())
  WHERE id = p_user_id;
  
  -- Add light transaction record
  INSERT INTO light_transactions (to_user_id, amount, transaction_type, description)
  VALUES (p_user_id, 10, 'mission_reward', 
          'Награда за завершение миссии: ' || mission_record.name);
  
  -- Check if there's an artifact to award
  SELECT * INTO artifact_record FROM artifacts WHERE mission_id = p_mission_id;
  
  IF FOUND THEN
    -- Award artifact if not already owned
    INSERT INTO user_artifacts (user_id, artifact_id, source)
    VALUES (p_user_id, artifact_record.id, 'mission_completion')
    ON CONFLICT (user_id, artifact_id) DO NOTHING;
  END IF;
  
  -- Get next mission info (next missions cost 10 light)
  SELECT * INTO next_mission_record FROM missions 
  WHERE element_id = mission_record.element_id 
    AND "order" = mission_record."order" + 1;
  
  -- Return completion data
  SELECT json_build_object(
    'light_earned', 10,
    'meditation_minutes', mission_record.duration_minutes,
    'next_mission_cost', CASE 
      WHEN next_mission_record.id IS NOT NULL THEN 10 
      ELSE 0 
    END,
    'artifact_earned', CASE WHEN artifact_record.id IS NOT NULL THEN 
      json_build_object(
        'id', artifact_record.id,
        'name', artifact_record.name,
        'description', artifact_record.description,
        'rarity', artifact_record.rarity
      ) ELSE NULL END
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle referral system
CREATE OR REPLACE FUNCTION handle_referral(
  p_referrer_id bigint,
  p_referred_id bigint
)
RETURNS boolean AS $$
BEGIN
  -- Check if referral already exists
  IF EXISTS (
    SELECT 1 FROM user_referrals 
    WHERE referrer_user_id = p_referrer_id AND referred_user_id = p_referred_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Create referral record
  INSERT INTO user_referrals (referrer_user_id, referred_user_id)
  VALUES (p_referrer_id, p_referred_id);
  
  -- Give bonus to referrer (+100 СВЕТА)
  UPDATE users 
  SET light_balance = light_balance + 100
  WHERE id = p_referrer_id;
  
  -- Give bonus to referred user (+100 СВЕТА)
  UPDATE users 
  SET light_balance = light_balance + 100
  WHERE id = p_referred_id;
  
  -- Add transaction records
  INSERT INTO light_transactions (to_user_id, amount, transaction_type, description)
  VALUES 
    (p_referrer_id, 100, 'referral_bonus', 'Бонус за приглашение друга'),
    (p_referred_id, 100, 'referral_bonus', 'Бонус за регистрацию по приглашению');
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- ---
-- POLICIES & RLS
-- ---

-- Enable RLS for all tables
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE light_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public can read elements" ON public.elements FOR SELECT USING (true);
CREATE POLICY "Public can read missions" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Public can read artifacts" ON public.artifacts FOR SELECT USING (true);
CREATE POLICY "Public can read practices" ON public.practices FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Users can insert own data" ON public.users FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can read own progress" ON public.mission_progress FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own progress" ON public.mission_progress FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own progress" ON public.mission_progress FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can read own artifacts" ON public.user_artifacts FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can read own referrals" ON public.user_referrals FOR SELECT USING (auth.uid()::text = referrer_user_id::text OR auth.uid()::text = referred_user_id::text);
CREATE POLICY "Users can insert referrals" ON public.user_referrals FOR INSERT WITH CHECK (auth.uid()::text = referrer_user_id::text OR auth.uid()::text = referred_user_id::text);
CREATE POLICY "Users can read own transactions" ON public.light_transactions FOR SELECT USING (auth.uid()::text = to_user_id::text OR auth.uid()::text = from_user_id::text);
CREATE POLICY "Users can read own sessions" ON public.user_sessions FOR SELECT USING (auth.uid()::text = user_id::text);