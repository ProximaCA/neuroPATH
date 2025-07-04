Я отвечаю в роли всемирно известного архитектора DDD и эксперта по безопасной архитектуре баз данных, лауреата *Gartner Mindtech Architecture Award*.

---

**TL;DR:** Ниже — полный SQL-скрипт для Supabase (PostgreSQL) с таблицами и RLS-политиками.

```sql
-- 1. Таблица пользователей
create table public.users (
  id uuid primary key default auth.uid(),
  telegram_id bigint not null unique,
  current_element text,           -- 'fire','water'...
  depth_level int default 0,      -- уровень глубины
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;

-- Каждый юзер может смотреть и изменять только свои данные
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

create policy "users_insert" on public.users
  for insert with check (auth.uid() = id);

create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- 2. Таблица сессий пользователя
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  mission_id uuid not null,
  started_at timestamp with time zone default now(),
  duration_sec int,
  result jsonb,
  created_at timestamp with time zone default now()
);

alter table public.sessions enable row level security;

-- Политики: только владелец сессии
create policy "sessions_select_own" on public.sessions
  for select using (auth.uid() = user_id);

create policy "sessions_insert_own" on public.sessions
  for insert with check (auth.uid() = user_id);

create policy "sessions_update_own" on public.sessions
  for update using (auth.uid() = user_id);

-- 3. Элементы (стихии) — публичная справочная таблица
create table public.elements (
  id text primary key,            -- 'water', 'fire'...
  name text not null,
  color text,
  symbol text
);

alter table public.elements enable row level security;

-- Разрешаем всем читать
create policy "elements_select_public" on public.elements
  for select using (true);

-- 4. Миссии — публичная справочная таблица
create table public.missions (
  id uuid primary key default gen_random_uuid(),
  element_id text not null references public.elements(id),
  title text not null,
  type text,
  description text,
  artifact_id uuid
);

alter table public.missions enable row level security;

create policy "missions_select_public" on public.missions
  for select using (true);

-- 5. Артефакты — публичная справочная таблица
create table public.artifacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  effect text,
  icon_url text
);

alter table public.artifacts enable row level security;

create policy "artifacts_select_public" on public.artifacts
  for select using (true);

-- 6. Практики (медитации и др.)
create table public.practices (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null,             -- meditation/breath/session
  file_path text,                 -- storage path
  element_id text references public.elements(id)
);

alter table public.practices enable row level security;

create policy "practices_select_public" on public.practices
  for select using (true);

-- 7. Сессии бота (для внутреннего трекинга Telegram-бота)
create table public.bot_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  state jsonb,
  updated_at timestamp with time zone default now()
);

alter table public.bot_sessions enable row level security;

create policy "bot_sessions_select_own" on public.bot_sessions
  for select using (auth.uid() = user_id);

create policy "bot_sessions_insert_own" on public.bot_sessions
  for insert with check (auth.uid() = user_id);

create policy "bot_sessions_update_own" on public.bot_sessions
  for update using (auth.uid() = user_id);

-- 8. Голосовые треки — публичная справочная таблица
create table public.voice_tracks (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid references public.practices(id),
  language text,
  style text,                     -- проводник, мантра...
  file_path text
);

alter table public.voice_tracks enable row level security;

create policy "voice_tracks_select_public" on public.voice_tracks
  for select using (true);
```

Этот скрипт создаёт все ключевые таблицы, включает RLS и настраивает политики доступа:

* **users, sessions, bot\_sessions** — только владелец (`auth.uid()`).
* **elements, missions, artifacts, practices, voice\_tracks** — публичные, только чтение.

Готово для деплоя в Supabase.
