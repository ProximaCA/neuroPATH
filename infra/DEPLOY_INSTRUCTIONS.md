# 🚀 Инструкции по развертыванию Алхимии Разума

## 📋 База данных (Supabase)

### 🔄 Применение миграции (если таблицы уже существуют)

Если вы получили ошибку `relation "friends" already exists`, используйте миграционный файл:

1. **Зайдите в Supabase Dashboard**
   - Откройте ваш проект в [supabase.com](https://supabase.com)
   - Перейдите в раздел `SQL Editor`

2. **Примените миграцию**
   ```sql
   -- Скопируйте и выполните содержимое файла:
   -- infra/supabase/migration_add_referrals.sql
   ```

3. **Проверьте результат**
   ```sql
   -- Проверьте что таблица создана
   SELECT * FROM user_referrals LIMIT 1;
   
   -- Проверьте функции
   SELECT routine_name FROM information_schema.routines 
   WHERE specific_schema = 'public' 
   AND routine_name IN ('complete_mission', 'handle_referral');
   ```

### 🆕 Первое развертывание (чистая БД)

Если у вас новая/пустая база данных:

1. **Примените полную схему**
   ```sql
   -- Выполните содержимое файла:
   -- infra/supabase/schema.sql
   ```

2. **Добавьте тестовые данные**
   ```sql
   -- Выполните содержимое файла:
   -- infra/supabase/seed.sql
   ```

## 🤖 Telegram Bot

### Настройка переменных окружения

Создайте файл `telegram-bot/.env`:
```env
BOT_TOKEN=your_bot_token_from_botfather
WEB_APP_URL=https://your-app-url.vercel.app
```

### Запуск бота
```bash
cd telegram-bot
npm install
npm start
```

## 🌐 Frontend (Next.js)

### Настройка переменных окружения

Создайте файл `nextjs-starter/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Запуск локально
```bash
cd nextjs-starter
bun install
bun run dev
```

### Развертывание на Vercel
1. Подключите репозиторий к Vercel
2. Установите переменные окружения в настройках Vercel
3. Задеплойте проект

## ⚠️ Важные моменты

### PowerShell команды
В Windows PowerShell используйте:
```powershell
# Вместо &&
cd nextjs-starter; bun run dev

# Или по отдельности
cd nextjs-starter
bun run dev
```

### Функциональность после деплоя
После применения миграции будут работать:

✅ **Реферальная система**
- +100 света за каждого приглашенного
- Отслеживание всех рефералов  
- Вкладка "Друзья" в профиле

✅ **Система прогресса**
- +10 света за каждую медитацию
- 100 света стоимость следующих уроков
- Корректное начисление артефактов

✅ **UI компоненты**
- Все иконки работают
- Трёхвкладочный профиль
- Статистика по стихиям

## 🔍 Тестирование

1. **Запустите приложение**
2. **Протестируйте реферальную ссылку**:
   - `t.me/your_bot?start=ref_123456`
3. **Пройдите медитацию до конца**
4. **Проверьте начисление света и артефактов**

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи Supabase
2. Убедитесь что все переменные окружения установлены
3. Проверьте что миграция применена успешно 