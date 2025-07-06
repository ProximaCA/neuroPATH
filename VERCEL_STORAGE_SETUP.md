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