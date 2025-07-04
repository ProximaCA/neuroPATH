# 🗄️ НАСТРОЙКА SUPABASE ДЛЯ АЛХИМИИ РАЗУМА

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### 1️⃣ Создание проекта

1. Переходи на [supabase.com](https://supabase.com)
2. Регистрируйся / логинься
3. Нажимай **"New project"**
4. Выбирай организацию
5. Заполняй:
   - **Name:** `neuropath-water` (или как хочешь)
   - **Database Password:** придумай сильный пароль и **ЗАПОМНИ ЕГО!**
   - **Region:** выбери ближайший к России (например, Frankfurt)
6. Нажимай **"Create new project"**

### 2️⃣ Получение API ключей

После создания проекта:

1. Переходи в **Project Settings** → **API**
2. Копируй эти значения:
   - **Project URL** (будет вида `https://xxx.supabase.co`)
   - **anon public key** (длинный токен для клиента)
   - **service_role key** (секретный ключ для админки)

### 3️⃣ Применение SQL схем

1. В Dashboard Supabase переходи в **SQL Editor**
2. Нажимай **"New query"**
3. Копируй и вставляй весь код из файла `infra/supabase/schema.sql`
4. Нажимай **"Run"** ▶️
5. Убедись что все выполнилось без ошибок

### 4️⃣ Добавление данных

1. Снова в **SQL Editor** создай новый query
2. Копируй и вставляй код из `infra/supabase/seed.sql`  
3. Нажимай **"Run"** ▶️
4. Проверь что данные добавились в **Table Editor**

### 5️⃣ Настройка переменных окружения

Создай файл `.env.local` в папке `nextjs-starter/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://твой-проект-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=твой-anon-key

# Telegram Bot (заполнишь позже)
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=
```

### 6️⃣ Проверка работы

```bash
cd nextjs-starter
bun run dev
```

Переходи на `http://localhost:3000` и проверяй:
- ✅ Главная страница загружается
- ✅ Карточка "Вода" содержит реальные данные из базы
- ✅ Переход на `/elements/water` работает
- ✅ Миссии загружаются из Supabase

## 🔧 SQL СХЕМЫ ДЛЯ КОПИРОВАНИЯ

### Schema (schema.sql):
```sql
-- Drop existing tables to ensure a clean slate
DROP TABLE IF EXISTS user_artifacts CASCADE;
DROP TABLE IF EXISTS mission_progress CASCADE;
DROP TABLE IF EXISTS practices CASCADE;
DROP TABLE IF EXISTS artifacts CASCADE;
DROP TABLE IF EXISTS missions CASCADE;
DROP TABLE IF EXISTS elements CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- User Table: Stores user information from Telegram
create table users (
  id bigint primary key, -- Using Telegram user ID as the primary key
  first_name text,
  last_name text,
  username text,
  current_element_id uuid, -- Add the missing column
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Elements Table: Stores elemental archetypes (Water, Fire, etc.)
create table elements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  color_code text,
  image_url text
);

-- Missions Table: Stores missions for each element
create table missions (
  id uuid primary key default gen_random_uuid(),
  element_id uuid references elements(id) on delete cascade not null,
  name text not null,
  description text,
  "order" int not null,
  audio_url text
);

-- Mission Progress Table: Tracks user progress on missions
create table mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references users(id) on delete cascade not null,
  mission_id uuid references missions(id) on delete cascade not null,
  status text not null, -- e.g., 'not_started', 'in_progress', 'completed'
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  unique(user_id, mission_id)
);

-- Practices Table: Stores meditation/practice tracks
create table practices (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references missions(id) not null,
  title text not null,
  audio_url text,
  duration_seconds int
);

-- Artifacts Table: Stores rewards for completing missions
create table artifacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon_url text
);

-- User Artifacts Table: Tracks artifacts collected by users (join table)
create table user_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references users(id) not null,
  artifact_id uuid references artifacts(id) not null,
  acquired_at timestamp default now(),
  unique(user_id, artifact_id)
);

-- Add foreign key constraint to users table after elements table is created
alter table users
add constraint fk_current_element
foreign key (current_element_id)
references elements(id);

-- ---
-- POLICIES & RLS
-- ---

-- 1. Enable RLS for all tables that need it.
ALTER TABLE elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_artifacts ENABLE ROW LEVEL SECURITY;

-- 2. Create policies to allow public (anon) read access to elements and missions.
CREATE POLICY "Public can read elements" ON public.elements FOR SELECT USING (true);
CREATE POLICY "Public can read missions" ON public.missions FOR SELECT USING (true);
```

### Seed Data (seed.sql):
```sql
-- Clear tables before seeding to make the script idempotent
TRUNCATE TABLE missions, elements RESTART IDENTITY CASCADE;

-- Make the script idempotent by clearing existing data first
TRUNCATE 
  users, 
  elements, 
  missions, 
  practices, 
  artifacts, 
  user_missions, 
  user_artifacts 
CASCADE;

-- Seed data for the "Water" element

-- 1. Insert the Water Element
insert into elements (id, name, description, color_code, image_url)
values ('f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Вода', 'Стихия эмоционального принятия, страха и чувств.', '#00A9FF', '/images/elements/water-card.png');

-- 2. Insert Missions for Water
insert into missions (id, element_id, name, description, "order", audio_url)
values 
  ('d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Погружение', 'Первый контакт, скан состояния.', 1, null),
  ('a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Растворение', 'Освобождение от страха.', 2, null),
  ('b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Поток принятия', 'Работа с обидой и другими эмоциями.', 3, null);

-- 3. Insert Practices for the "Погружение" Mission
insert into practices (id, mission_id, title, audio_url, duration_seconds)
values
  ('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'Трек-введение: Погружение', '/audio/water_intro.mp3', 180);

-- 4. Insert Artifacts
insert into artifacts (id, name, description, icon_url)
values
  ('c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'Жемчужина Чуткости', 'Артефакт, усиливающий эмпатию.', '/images/artifacts/pearl.png'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Слеза Силы', 'Символ принятия уязвимости.', '/images/artifacts/tear.png');
```

## ✅ ПРОВЕРОЧНЫЙ СПИСОК

- [ ] Supabase проект создан
- [ ] API ключи скопированы
- [ ] SQL схемы применены без ошибок
- [ ] Seed данные добавлены
- [ ] .env.local файл создан с правильными ключами
- [ ] Next.js приложение запущено и работает
- [ ] Данные стихии Вода загружаются из базы

## 🚀 СЛЕДУЮЩИЙ ШАГ

После успешной настройки базы переходим к созданию Telegram бота с aigrambot! 🤖 