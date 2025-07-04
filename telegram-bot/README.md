# neuroPATH Telegram Bot 🤖

Telegram бот для приложения "Алхимия Разума" - интеграция с Telegram Web App для медитативных практик и работы с эмоциями.

## 🚀 Быстрый старт

### 1. Создание бота в Telegram

1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Введите имя бота: `neuroPATH Alchemy Bot`
4. Введите username: `neuropath_alchemy_bot` (или любой доступный)
5. Сохраните полученный токен

### 2. Настройка Web App

1. Отправьте [@BotFather](https://t.me/botfather) команду `/setmenubutton`
2. Выберите вашего бота
3. Введите текст кнопки: `🧠 Алхимия Разума`
4. Введите URL: `http://localhost:3000` (для разработки)

### 3. Установка и запуск

```bash
# Перейти в папку бота
cd telegram-bot

# Установить зависимости
npm install

# Скопировать файл настроек
cp env.example .env

# Отредактировать .env файл - добавить токен бота
nano .env

# Запустить бота
npm start

# Или для разработки с автоперезагрузкой
npm run dev
```

### 4. Настройка .env файла

```env
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
WEB_APP_URL=http://localhost:3000
```

## 🔧 Команды бота

- `/start` - Приветствие и открытие Web App
- `/profile` - Прямая ссылка на профиль
- `/progress` - Просмотр прогресса
- `/help` - Справка по командам

## 🌐 Интеграция с Web App

Бот получает данные от веб-приложения через `window.Telegram.WebApp.sendData()`:

```javascript
// Отправка данных о завершении миссии
window.Telegram.WebApp.sendData(JSON.stringify({
  type: 'mission_completed',
  missionName: 'Погружение',
  artifact: 'Жемчужина Чуткости',
  lightEarned: 20,
  level: 2
}));
```

### Поддерживаемые типы событий:

- `mission_completed` - Завершение миссии
- `element_unlocked` - Разблокировка новой стихии  
- `friend_light_sent` - Отправка СВЕТА другу

## 🚀 Деплой в продакшн

### Vercel (рекомендуется)

1. Создайте аккаунт на [Vercel](https://vercel.com)
2. Подключите GitHub репозиторий
3. Настройте переменные окружения:
   - `BOT_TOKEN` - токен бота
   - `WEB_APP_URL` - URL вашего веб-приложения

### Railway

1. Создайте аккаунт на [Railway](https://railway.app)
2. Подключите GitHub репозиторий
3. Настройте переменные окружения
4. Деплой произойдет автоматически

### Heroku

```bash
# Установить Heroku CLI
# Создать приложение
heroku create neuropath-bot

# Настроить переменные
heroku config:set BOT_TOKEN=your_token
heroku config:set WEB_APP_URL=https://your-app.vercel.app

# Деплой
git push heroku main
```

## 🔐 Безопасность

1. **Никогда не коммитьте токен бота** в Git
2. Используйте переменные окружения
3. В продакшене настройте webhook вместо polling
4. Валидируйте данные от Web App

## 📱 Тестирование

1. Запустите веб-приложение: `npm run dev` (в папке nextjs-starter)
2. Запустите бота: `npm start` (в папке telegram-bot)
3. Найдите бота в Telegram и отправьте `/start`
4. Нажмите кнопку "🧠 Открыть Алхимию Разума"

## 🐛 Отладка

```bash
# Логи бота
npm start

# В случае ошибок проверьте:
# 1. Правильность токена бота
# 2. Доступность веб-приложения
# 3. Настройки Web App в BotFather
```

## 📚 Полезные ссылки

- [Grammy.js документация](https://grammy.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web Apps](https://core.telegram.org/bots/webapps)
- [BotFather](https://t.me/botfather) 