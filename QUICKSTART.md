# ⚡ Быстрый старт neuroPATH

## 1. Выгрузка на GitHub (5 минут)

```bash
# Клонирование и настройка
git init
git remote add origin https://github.com/ProximaCA/neuroPATH.git

# Commit и push
git add .
git commit -m "🎉 Initial commit: neuroPATH Telegram Web App"
git branch -M main
git push -u origin main
```

## 2. Развертывание на Vercel (10 минут)

### Создание проекта
1. Перейдите на [vercel.com](https://vercel.com)
2. **New Project** → выберите `neuroPATH`
3. **Settings**:
   - Framework: Next.js
   - Root Directory: `nextjs-starter`
   - Build Command: `bun run build`
   - Install Command: `bun install`

### Переменные среды
Добавьте в Environment Variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_DEV_MODE=false
```

## 3. Настройка Supabase (15 минут)

### Создание проекта
1. [supabase.com](https://supabase.com) → New Project
2. Выполните SQL из `infra/supabase/schema.sql`
3. Добавьте данные из `infra/supabase/seed.sql`

### Получение ключей
Settings → API → копируйте URL и anon key

## 4. Telegram Bot (10 минут)

### Создание бота
1. [@BotFather](https://t.me/BotFather) → `/newbot`
2. Получите токен
3. Настройте Web App:
   ```
   /setmenubutton
   @your_bot_name
   button_text=🧙‍♂️ Алхимия Разума
   web_app_url=https://your-app.vercel.app
   ```

### Развертывание бота
```bash
cd telegram-bot
bun install
cp env.example .env
# Отредактируйте .env с вашими данными
```

Развернуть на [Railway](https://railway.app) или [Render](https://render.com)

## 5. GitHub Actions (5 минут)

### Секреты в GitHub
Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN=получите в Vercel Settings
VERCEL_ORG_ID=из .vercel/project.json
VERCEL_PROJECT_ID=из .vercel/project.json
NEXT_PUBLIC_SUPABASE_URL=ваш_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_supabase_key
```

## 6. Проверка ✅

1. Откройте Telegram бота
2. Нажмите кнопку "🧙‍♂️ Алхимия Разума"
3. Проверьте функционал

---

**Время развертывания: ~45 минут**

🎯 **Готово!** neuroPATH развернут и готов к использованию! 