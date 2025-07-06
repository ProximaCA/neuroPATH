# Настройка Redis для neuroPATH

## Переменные окружения

### Для локальной разработки
Создайте файл `.env.local` в папке `nextjs-starter`:

```env
REDIS_URL=redis://default:T2t2JroPHNpvxaULSt3yUtPGj2ha3C3N@redis-14772.c15.us-east-1-4.ec2.redns.redis-cloud.com:14772
```

### Для production на Vercel
1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект neuroPATH
3. Перейдите в Settings → Environment Variables
4. Добавьте переменную:
   - Name: `REDIS_URL`
   - Value: `redis://default:T2t2JroPHNpvxaULSt3yUtPGj2ha3C3N@redis-14772.c15.us-east-1-4.ec2.redns.redis-cloud.com:14772`
   - Environment: Production, Preview, Development

## Структура данных в Redis

### Ключи
- `user:{id}` - данные пользователя
- `progress:{userId}` - прогресс миссий пользователя
- `artifacts:{userId}` - артефакты пользователя
- `referrals:{userId}` - рефералы пользователя
- `ref:{referrerId}:{referredId}` - связь реферал-реферер

### Формат данных
Все данные хранятся в JSON формате.

## Проверка подключения

После деплоя проверьте:
1. Создание пользователя при первом входе
2. Сохранение прогресса миссий
3. Начисление минут и света
4. Работу реферальной системы
5. Отображение друзей

## Telegram Bot

Бот также использует тот же Redis instance. В файле `telegram-bot/bot.js` уже настроено подключение с использованием той же переменной `REDIS_URL`. 