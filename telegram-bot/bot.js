// Загружаем переменные окружения
require('dotenv').config();

const { Bot, InlineKeyboard } = require('grammy');
const Redis = require('ioredis');

// Замените на ваш токен бота от @BotFather
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

// URL вашего веб-приложения (замените на ваш реальный URL)
const WEB_APP_URL = process.env.WEB_APP_URL || 'http://localhost:3000';

const bot = new Bot(BOT_TOKEN);

const redis = new Redis(process.env.REDIS_URL); // REDIS_URL = KV_URL из Vercel

// Отладочный вывод
console.log('🤖 Запуск Telegram бота...');
console.log('🔑 Токен загружен:', BOT_TOKEN ? 'Да' : 'Нет');
console.log('🌐 URL приложения:', WEB_APP_URL);

// Команда /start
bot.command('start', async (ctx) => {
  const startPayload = ctx.match; // Получаем параметр после /start
  let referralMessage = '';
  
  // Проверяем есть ли реферальный код
  if (startPayload && startPayload.startsWith('ref_')) {
    const referrerId = startPayload.replace('ref_', '');
    referralMessage = `\n🎁 Вы пришли по приглашению! За регистрацию вы и ваш друг получите по +100 СВЕТА!`;
    
    // Отправляем данные в веб-приложение для обработки реферала
    console.log(`👥 Новый пользователь ${ctx.from.id} пришел по реферальной ссылке от ${referrerId}`);
    
    // Сохраняем реферальную информацию в URL для обработки веб-приложением
    const webAppUrl = `${WEB_APP_URL}?referrer=${referrerId}&new_user=${ctx.from.id}`;
    const keyboard = new InlineKeyboard()
      .webApp('🧠 Открыть Алхимию Разума', webAppUrl);

    await ctx.reply(
      `🌊 Добро пожаловать в "Алхимию Разума"!${referralMessage}

Это приложение поможет вам:
• Проработать эмоции через 4 стихии
• Освоить медитативные практики
• Собрать коллекцию артефактов
• Отслеживать свой прогресс
Команды - /help
Нажмите кнопку ниже, чтобы начать путешествие:`,
      { reply_markup: keyboard }
    );
    return;
  }

  const keyboard = new InlineKeyboard()
    .webApp('🧠 Открыть Алхимию Разума', WEB_APP_URL);

  await ctx.reply(
    `🌊 Добро пожаловать в "Алхимию Разума"!

Это приложение поможет вам:
• Проработать эмоции через 4 стихии
• Освоить медитативные практики
• Собрать коллекцию артефактов
• Отслеживать свой прогресс

Команды - /help
Нажмите кнопку ниже, чтобы начать путешествие:`,
    { reply_markup: keyboard }
  );
});

// Команда /help
bot.command('help', async (ctx) => {
  await ctx.reply(
    `🔮 Команды бота:

/start - Открыть приложение
/profile - Посмотреть профиль
/progress - Показать прогресс
/help - Эта справка

Основное взаимодействие происходит через веб-приложение.`
  );
});

// Команда /profile
bot.command('profile', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('👤 Открыть профиль', `${WEB_APP_URL}/profile`);

  await ctx.reply(
    '👤 Ваш профиль в приложении:',
    { reply_markup: keyboard }
  );
});

// Команда /progress
bot.command('progress', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .webApp('📊 Посмотреть прогресс', `${WEB_APP_URL}/profile`);

  await ctx.reply(
    '📊 Отслеживайте свой прогресс в приложении:',
    { reply_markup: keyboard }
  );
});

// Обработка сообщений с данными от веб-приложения
bot.on('message:web_app_data', async (ctx) => {
  const data = JSON.parse(ctx.message.web_app_data.data);
  
  switch (data.type) {
    case 'mission_completed':
      await ctx.reply(
        `🎉 Поздравляем! Вы завершили миссию "${data.missionName}"!
        
💎 Получен артефакт: ${data.artifact}
⭐ Заработано СВЕТА: ${data.lightEarned}
📈 Новый уровень: ${data.level}`
      );
      break;
      
    case 'element_unlocked':
      await ctx.reply(
        `🔓 Новая стихия разблокирована: ${data.elementName}!
        
Теперь доступны новые медитации и артефакты.`
      );
      break;
      
    case 'friend_light_sent':
      await ctx.reply(
        `💫 Вы отправили ${data.amount} СВЕТА пользователю ${data.friendName}!
        
Добрые дела возвращаются удачей. ✨`
      );
      break;
      
    default:
      await ctx.reply('Данные получены! 👍');
  }
});

// Обработка ошибок
bot.catch((err) => {
  console.error('Ошибка бота:', err);
});

// Запуск бота
bot.start();

console.log('✅ Бот запущен и готов к работе!');

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('🛑 Остановка бота...');
  bot.stop();
  process.exit(0);
});

process.once('SIGTERM', () => {
  console.log('🛑 Остановка бота...');
  bot.stop();
  process.exit(0);
});

// Пример: сохранить прогресс пользователя
async function saveUserProgress(userId, progress) {
  await redis.set(`progress:${userId}`, JSON.stringify(progress));
}

// Пример: получить прогресс пользователя
async function getUserProgress(userId) {
  const data = await redis.get(`progress:${userId}`);
  return data ? JSON.parse(data) : null;
} 