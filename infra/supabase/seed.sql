-- Clear tables before seeding to make the script idempotent
TRUNCATE TABLE 
  user_artifacts,
  mission_progress,
  practices, 
  artifacts, 
  missions,
  elements,
  users,
  friends,
  light_transactions,
  user_sessions
RESTART IDENTITY CASCADE;

-- Seed data for the "Water" element

-- 1. Insert the Water Element
INSERT INTO elements (id, name, description, color_code, image_url, unlock_level, total_missions)
VALUES ('f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Вода', 'Стихия эмоционального принятия, страха и чувств.', '#00A9FF', '/images/elements/water_card.png', 1, 3);

-- 2. Insert Missions for Water with enhanced data
INSERT INTO missions (id, element_id, name, description, "order", audio_url, duration_minutes, light_reward, xp_reward, unlock_condition)
VALUES 
  ('d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Погружение', 'Первый контакт с водной стихией. Изучение своего эмоционального состояния через медитацию погружения.', 1, '/audio/water/meditation_1.mp3', 5, 20, 100, '{"level": 1}'),
  ('a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Растворение', 'Освобождение от страха через принятие. Работа с глубинными эмоциями.', 2, '/audio/water/meditation_2.mp3', 7, 30, 150, '{"previous_mission": "d9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d"}'),
  ('b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'Поток принятия', 'Мастерство водной стихии. Работа с обидой и трансформация эмоций в силу.', 3, '/audio/water/meditation_3.mp3', 10, 50, 200, '{"previous_mission": "a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d"}');

-- 3. Insert Practices for each mission
INSERT INTO practices (id, mission_id, title, audio_url, duration_seconds, step_order)
VALUES
  -- Погружение practices
  ('e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b', 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'Подготовка к погружению', '/audio/water/intro_1.mp3', 60, 1),
  ('f2a3b4c5-d6e7-4f8a-9b0c-1d2e3f4a5b6c', 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'Основная медитация', '/audio/water/main_1.mp3', 240, 2),
  ('a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d', 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'Завершение и интеграция', '/audio/water/outro_1.mp3', 60, 3),
  
  -- Растворение practices
  ('b4c5d6e7-f8a9-4b0c-1d2e-3f4a5b6c7d8e', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'Вхождение в состояние', '/audio/water/intro_2.mp3', 90, 1),
  ('c5d6e7f8-a9b0-4c1d-2e3f-4a5b6c7d8e9f', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'Работа со страхом', '/audio/water/main_2.mp3', 300, 2),
  ('d6e7f8a9-b0c1-4d2e-3f4a-5b6c7d8e9f0a', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'Освобождение', '/audio/water/outro_2.mp3', 90, 3),
  
  -- Поток принятия practices
  ('e7f8a9b0-c1d2-4e3f-4a5b-6c7d8e9f0a1b', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 'Настройка на поток', '/audio/water/intro_3.mp3', 120, 1),
  ('f8a9b0c1-d2e3-4f4a-5b6c-7d8e9f0a1b2c', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 'Трансформация обиды', '/audio/water/main_3.mp3', 360, 2),
  ('a9b0c1d2-e3f4-4a5b-6c7d-8e9f0a1b2c3d', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 'Мастерство потока', '/audio/water/outro_3.mp3', 120, 3);

-- 4. Insert Artifacts with mission assignments
INSERT INTO artifacts (id, name, description, icon_url, rarity, element_id, mission_id, light_value)
VALUES
  ('c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'Жемчужина Чуткости', 'Первый артефакт водной стихии. Усиливает способность к эмпатии и пониманию собственных эмоций.', '/images/artifacts/pearl.jpg', 'common', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 10),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Слеза Освобождения', 'Символ принятия уязвимости и силы в слабости. Помогает работать со страхами.', '/images/artifacts/tear.jpg', 'rare', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 25),
  ('d3e4f5a6-b7c8-4d9e-0f1a-2b3c4d5e6f7a', 'Кристалл Потока', 'Мастерский артефакт водной стихии. Дает способность трансформировать любые эмоции в созидательную силу.', '/images/artifacts/crystal.jpg', 'epic', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 50);

-- 5. Insert demo user for testing (Telegram ID: 123456789)
INSERT INTO users (id, first_name, last_name, username, photo_url, language_code, current_element_id, light_balance, level, total_missions_completed)
VALUES (123456789, 'Тест', 'Пользователь', 'test_user', null, 'ru', 'f2e4e168-e5a9-4a9c-b829-3e2c1a8a0b1a', 100, 2, 1);

-- 6. Insert demo mission progress for test user
INSERT INTO mission_progress (user_id, mission_id, status, progress_percentage, current_step, total_steps, time_spent_seconds, attempts)
VALUES 
  (123456789, 'd9e3f8a0-cb3a-4c9c-8f1a-6d5b7a8e9c0d', 'completed', 100, 3, 3, 300, 1),
  (123456789, 'a7b2c1d0-e8f9-4a3b-9c8d-7e6f5a4b3c2d', 'in_progress', 60, 2, 3, 180, 1),
  (123456789, 'b3c4d5e6-f7a8-4b9c-8d1e-2f3a4b5c6d7e', 'not_started', 0, 0, 3, 0, 0);

-- 7. Award artifact to test user
INSERT INTO user_artifacts (user_id, artifact_id, source)
VALUES (123456789, 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f', 'mission_completion');

-- 8. Insert light transaction for test user
INSERT INTO light_transactions (to_user_id, amount, transaction_type, description)
VALUES (123456789, 20, 'mission_reward', 'Награда за завершение миссии: Погружение');

-- Note: UUIDs are hardcoded for consistency between seed data.
-- In production, you might generate them dynamically. 