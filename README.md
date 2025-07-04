# neuroPATH "Алхимия Разума" 🧠

Telegram Web App для работы с эмоциями и ментальным здоровьем через архетипы четырех стихий: Вода, Огонь, Воздух, Земля.

## 🌊 Концепция

Приложение представляет собой психологическую RPG, где пользователь проходит медитативные миссии по четырем стихиям:

- **🌊 Вода** - Эмоциональное принятие, работа со страхами
- **🔥 Огонь** - Пробуждение воли, сила действия  
- **🌪️ Воздух** - Ментальная лёгкость, прояснение ума
- **🌍 Земля** - Стабилизация, укоренение, телесная ясность

## 🛠 Технологический стек

- **Frontend**: Next.js 14 + TypeScript + Once UI
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Telegram**: Grammy.js bot + Web App API
- **Стилизация**: Once UI Design System
- **Деплой**: Vercel (frontend) + Railway/Heroku (bot)

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone https://github.com/ProximaCA/neuroPATH.git
cd neuroPATH
```

### 2. Настройка Supabase

1. Создайте проект на [Supabase](https://supabase.com)
2. Выполните SQL из `infra/supabase/schema.sql`
3. Загрузите тестовые данные из `infra/supabase/seed.sql`
4. Скопируйте URL и anon key

### 3. Настройка веб-приложения

```bash
cd nextjs-starter

# Установка зависимостей
bun install

# Настройка переменных окружения
cp .env.local.example .env.local

# Отредактируйте .env.local:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Запуск в режиме разработки
bun run dev
```

### 4. Настройка Telegram бота

```bash
cd telegram-bot

# Установка зависимостей
npm install

# Настройка переменных окружения
cp env.example .env

# Отредактируйте .env:
# BOT_TOKEN=your_bot_token
# WEB_APP_URL=http://localhost:3000

# Запуск бота
npm start
```

### 5. Создание Telegram бота

1. Найдите [@BotFather](https://t.me/botfather)
2. Создайте нового бота: `/newbot`
3. Настройте Web App: `/setmenubutton`
4. Добавьте токен в `.env` файл

## 📁 Структура проекта

```
neuroPATH/
├── nextjs-starter/          # Next.js веб-приложение
│   ├── src/
│   │   ├── app/            # App Router страницы
│   │   ├── components/     # React компоненты
│   │   └── lib/           # Утилиты и контексты
│   └── public/            # Статические файлы
├── telegram-bot/           # Telegram бот
│   ├── bot.js             # Основная логика бота
│   └── package.json       # Зависимости бота
├── infra/
│   └── supabase/          # SQL схемы и данные
├── project_data/          # Документация концепции
└── docs/                  # Планы и документация
```

## 🎮 Основные функции

### Для пользователей:
- 🧘‍♀️ Медитативные практики по стихиям
- 📊 Отслеживание прогресса и статистики
- 🏆 Система артефактов и достижений
- 💫 СВЕТ - внутренняя валюта для социальных взаимодействий
- 👥 Добавление друзей и обмен СВЕТОМ
- 📱 Полная интеграция с Telegram

### Для разработчиков:
- 🔄 Real-time синхронизация с Supabase
- 🎨 Готовая UI система Once UI
- 📱 Telegram Web App API
- 🔒 Row Level Security (RLS)
- 🚀 Готовые схемы деплоя

## 🌊 Пример использования

1. Пользователь открывает бота в Telegram
2. Нажимает "🧠 Открыть Алхимию Разума"
3. Выбирает стихию Воды для начала
4. Проходит медитацию "Погружение" (5 мин)
5. Получает артефакт "Жемчужина Чуткости"
6. Зарабатывает 20 СВЕТА и повышает уровень
7. Может поделиться СВЕТОМ с друзьями

## 🗄️ База данных

### Основные таблицы:
- `users` - Пользователи с данными из Telegram
- `elements` - Четыре стихии
- `missions` - Медитативные миссии
- `mission_progress` - Прогресс пользователей
- `artifacts` - Коллекционные артефакты
- `user_artifacts` - Артефакты пользователей
- `light_transactions` - Транзакции СВЕТА

### Функции базы данных:
- `complete_mission()` - Завершение миссии с наградами
- `update_user_level()` - Автоматический расчет уровня

## 🚀 Деплой

### Frontend (Vercel)
```bash
# Подключите GitHub к Vercel
# Настройте переменные окружения
# Автоматический деплой при push
```

### Backend (Supabase)
```bash
# Уже в облаке, только настройка RLS
```

### Telegram Bot (Railway)
```bash
# Подключите GitHub к Railway
# Настройте BOT_TOKEN
# Автоматический деплой
```

## 🔧 API Endpoints

### Telegram Web App Integration
```javascript
// Отправка данных боту
window.Telegram.WebApp.sendData(JSON.stringify({
  type: 'mission_completed',
  missionName: 'Погружение',
  artifact: 'Жемчужина Чуткости'
}));

// Получение данных пользователя
const user = window.Telegram.WebApp.initDataUnsafe.user;
```

### Supabase Functions
```sql
-- Завершение миссии
SELECT complete_mission(user_id, mission_id);

-- Получение прогресса
SELECT * FROM mission_progress WHERE user_id = ?;
```

## 🐛 Отладка

### Веб-приложение
```bash
# Проверка подключения к Supabase
bun run dev
# Откройте http://localhost:3000
```

### Telegram бот
```bash
# Проверка токена и webhook
npm start
# Отправьте /start боту
```

### База данных
```sql
-- Проверка данных
SELECT * FROM users LIMIT 5;
SELECT * FROM mission_progress WHERE user_id = 123456789;
```

## 📱 Тестирование

1. **Локальная разработка**: `localhost:3000`
2. **Telegram Web App**: Через бота в Telegram
3. **Мобильное тестирование**: Telegram на телефоне
4. **Интеграционное тестирование**: Полный flow пользователя

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Сделайте изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE

## 🔗 Полезные ссылки

- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Once UI](https://once-ui.com)
- [Grammy.js](https://grammy.dev)

---

**Создано с 💙 для ментального здоровья и осознанности** 