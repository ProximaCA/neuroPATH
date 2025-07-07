# Настройка хранилища для neuroPATH через Vercel Marketplace

## 📋 Текущие опции хранилища в Vercel

Согласно актуальной документации Vercel, доступны следующие варианты:
- **Vercel Blob** - для больших файлов (изображения, видео)
- **Vercel Edge Config** - для конфигураций и feature flags
- **Redis через Upstash** (в Marketplace)
- **Postgres через Neon** (в Marketplace)

## 🚀 Рекомендуемое решение: Upstash Redis

### Вариант 1: Upstash Redis через Vercel Marketplace

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект neuroPATH
3. Перейдите в раздел **"Integrations"** или **"Marketplace"**
4. Найдите **Upstash Redis**
5. Нажмите **"Add Integration"**
6. Следуйте инструкциям для подключения

### Вариант 2: Прямое использование Upstash

1. Создайте аккаунт на [Upstash](https://upstash.com)
2. Создайте новую Redis базу данных
3. Получите credentials:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Добавьте их в Vercel Environment Variables

### Вариант 3: Использовать внешний Redis

Если у вас уже есть Redis instance (например, Redis Cloud), добавьте в Vercel переменную:
```
REDIS_URL=redis://default:password@host:port
```

## 📝 Обновление кода для работы с Upstash

Upstash предоставляет REST API, который работает в Edge Runtime без проблем.

## 🔧 Альтернатива: Vercel Edge Config

Для простого key-value хранилища можно использовать Edge Config:
- Ультра-быстрые чтения (< 1ms)
- Подходит для конфигураций
- Ограничение: обновления занимают секунды

## 💡 Что выбрать?

- **Upstash Redis** - если нужно полноценное key-value хранилище с быстрыми записями
- **Edge Config** - если данные меняются редко, но нужны мгновенные чтения
- **Внешний Redis** - если у вас уже есть Redis instance 

# 🔧 Настройка Redis для реферальной системы

## 🚨 Проблема
Реферальная система не работает, потому что Redis не настроен. Приложение использует in-memory storage, который не сохраняет данные между перезапусками.

## ✅ Решение: Настройка Upstash Redis

### Шаг 1: Создание Redis базы данных

1. **Перейдите на [Upstash Console](https://console.upstash.com/)**
2. **Войдите или зарегистрируйтесь**
3. **Создайте новую Redis базу данных:**
   - Нажмите "Create Database"
   - Выберите регион (рекомендуется ближайший к вам)
   - Введите имя: `neuropath-redis`
   - Нажмите "Create"

### Шаг 2: Получение credentials

После создания базы данных:

1. **Откройте созданную базу данных**
2. **Скопируйте следующие значения:**
   - `UPSTASH_REDIS_REST_URL` - URL для REST API
   - `UPSTASH_REDIS_REST_TOKEN` - токен для авторизации

### Шаг 3: Настройка переменных окружения

#### Для локальной разработки:
Создайте файл `.env.local` в папке `nextjs-starter/`:

```bash
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Alternative KV variable names (for compatibility)
KV_REST_API_URL=https://your-redis-instance.upstash.io
KV_REST_API_TOKEN=your-upstash-token
```

#### Для Vercel (продакшн):
1. **Откройте ваш проект в Vercel Dashboard**
2. **Перейдите в Settings → Environment Variables**
3. **Добавьте следующие переменные:**
   - `UPSTASH_REDIS_REST_URL` = ваш URL
   - `UPSTASH_REDIS_REST_TOKEN` = ваш токен
   - `KV_REST_API_URL` = ваш URL (дублирование для совместимости)
   - `KV_REST_API_TOKEN` = ваш токен (дублирование для совместимости)

### Шаг 4: Проверка работы

1. **Перезапустите приложение локально:**
   ```bash
   cd nextjs-starter
   npm run dev
   ```

2. **Проверьте логи:**
   - Не должно быть сообщений "Redis not configured, using in-memory storage"
   - Должны появиться сообщения об успешном подключении к Redis

3. **Протестируйте реферальную систему:**
   - Создайте реферальную ссылку в профиле
   - Откройте её в новом окне инкогнито
   - Проверьте, что друг появился в списке и начислился бонус

## 🔍 Диагностика проблем

### Проблема: "Redis not configured"
**Решение:** Проверьте переменные окружения в `.env.local` или Vercel Dashboard

### Проблема: "Connection failed"
**Решение:** 
- Проверьте правильность URL и токена
- Убедитесь, что база данных активна в Upstash Console
- Проверьте, что нет лишних пробелов в переменных

### Проблема: "Referral not working"
**Решение:**
- Убедитесь, что Redis настроен
- Проверьте, что Telegram бот передаёт правильные параметры
- Откройте Developer Tools и проверьте логи

## 🎯 Результат

После настройки Redis:
- ✅ Реферальная система работает
- ✅ Друзья отображаются в профиле
- ✅ Бонусы начисляются (+100 СВЕТА)
- ✅ Данные сохраняются между сессиями

## 📞 Поддержка

Если что-то не работает:
1. Проверьте все переменные окружения
2. Посмотрите логи в консоли браузера
3. Убедитесь, что Redis база данных активна
4. Перезапустите приложение после изменения переменных

---

**Важно:** Без настройки Redis реферальная система не будет работать, так как данные не сохраняются! 