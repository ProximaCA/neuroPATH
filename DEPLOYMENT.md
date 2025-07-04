# 🚀 Инструкция по развертыванию neuroPATH "Алхимия Разума"

## 1. Подготовка и выгрузка на GitHub

### Шаг 1: Создание репозитория на GitHub
1. Зайдите в GitHub и создайте новый репозиторий `neuroPATH`
2. Установите видимость репозитория (Public/Private)
3. НЕ инициализируйте с README, так как файлы уже есть

### Шаг 2: Настройка Git и push
```bash
# Инициализация Git (если не сделано)
git init

# Добавление remote origin
git remote add origin https://github.com/ProximaCA/neuroPATH.git

# Добавление всех файлов
git add .

# Первый коммит
git commit -m "🎉 Initial commit: neuroPATH Telegram Web App"

# Создание main ветки и push
git branch -M main
git push -u origin main
```

## 2. Настройка Vercel

### Шаг 1: Создание проекта в Vercel
1. Зайдите на [vercel.com](https://vercel.com) и войдите через GitHub
2. Нажмите "New Project"
3. Выберите репозиторий `neuroPATH`
4. Установите настройки:
   - **Framework Preset**: Next.js
   - **Root Directory**: `nextjs-starter`
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next`
   - **Install Command**: `bun install`

### Шаг 2: Настройка переменных среды в Vercel
В разделе "Environment Variables" добавьте:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_DEV_MODE=false
```

### Шаг 3: Настройка доменов
1. После развертывания получите URL вида: `https://neuropath-alchemy.vercel.app`
2. Опционально: добавьте кастомный домен в настройках проекта

## 3. Настройка GitHub Actions

### Шаг 1: Создание секретов в GitHub
Перейдите в Settings → Secrets and variables → Actions и добавьте:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Шаг 2: Получение Vercel токенов
1. **VERCEL_TOKEN**: 
   - Зайдите в Vercel → Settings → Tokens
   - Создайте новый токен

2. **VERCEL_ORG_ID** и **VERCEL_PROJECT_ID**:
   - Установите Vercel CLI: `npm i -g vercel`
   - В папке `nextjs-starter` выполните: `vercel`
   - Токены будут в файле `.vercel/project.json`

## 4. Настройка Telegram Bot

### Шаг 1: Создание и настройка бота
1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Настройте Web App:
   ```
   /setmenubutton
   @your_bot_name
   button_text=🧙‍♂️ Алхимия Разума
   web_app_url=https://your-vercel-app.vercel.app
   ```

### Шаг 2: Развертывание Telegram бота
```bash
# Переход в папку бота
cd telegram-bot

# Установка зависимостей
bun install

# Создание .env файла
cp env.example .env

# Редактирование .env
TELEGRAM_BOT_TOKEN=your_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
WEBHOOK_URL=https://your-vercel-app.vercel.app/api/telegram/webhook
```

### Шаг 3: Развертывание бота (Railway/Render)
Рекомендуется использовать Railway или Render для бота:

**Railway:**
1. Подключите GitHub репозиторий
2. Установите Root Directory: `telegram-bot`
3. Добавьте переменные среды
4. Автоматическое развертывание

## 5. Настройка Supabase

### Шаг 1: Создание проекта
1. Создайте проект на [supabase.com](https://supabase.com)
2. Выполните SQL из `infra/supabase/schema.sql`
3. Добавьте начальные данные из `infra/supabase/seed.sql`

### Шаг 2: Настройка RLS и API
1. Включите Row Level Security для всех таблиц
2. Создайте политики для безопасности
3. Получите URL и anon key из Settings → API

## 6. Проверка и тестирование

### Шаг 1: Проверка CI/CD
1. Сделайте изменения в коде
2. Создайте Pull Request
3. Убедитесь, что тесты проходят
4. После merge в main - автоматическое развертывание

### Шаг 2: Тестирование приложения
1. Откройте Telegram бота
2. Нажмите кнопку "🧙‍♂️ Алхимия Разума"
3. Проверьте функционал:
   - Регистрация пользователя
   - Выбор элементов
   - Медитации
   - Профиль и прогресс

## 7. Мониторинг и логи

### Vercel Analytics
1. Включите Analytics в настройках проекта
2. Мониторинг производительности и ошибок

### Supabase Dashboard
1. Мониторинг запросов к базе данных
2. Логи и метрики производительности

## 8. Дополнительные настройки

### Оптимизация SEO
```javascript
// В next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}
```

### Настройка кэширования
```json
// В vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🎯 Чек-лист развертывания

- [ ] Репозиторий создан и код загружен
- [ ] Vercel проект настроен
- [ ] Переменные среды добавлены
- [ ] GitHub Actions секреты настроены
- [ ] Supabase проект создан и настроен
- [ ] Telegram бот создан и настроен
- [ ] Бот развернут на хостинге
- [ ] Web App URL настроен в боте
- [ ] Приложение протестировано
- [ ] CI/CD pipeline работает

## 📞 Поддержка

При возникновении проблем проверьте:
1. Логи в Vercel Dashboard
2. Логи в Supabase Dashboard
3. GitHub Actions logs
4. Telegram bot logs

---

**Готово! 🚀 neuroPATH "Алхимия Разума" развернут и готов к использованию!** 