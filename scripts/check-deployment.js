#!/usr/bin/env node

/**
 * Скрипт проверки готовности neuroPATH к развертыванию
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Проверка готовности neuroPATH к развертыванию...\n');

const checks = [
  {
    name: 'Структура проекта',
    check: () => {
      const requiredFiles = [
        'nextjs-starter/package.json',
        'nextjs-starter/next.config.mjs',
        'nextjs-starter/vercel.json',
        'telegram-bot/package.json',
        'telegram-bot/bot.js',
        'infra/supabase/schema.sql',
        'infra/supabase/seed.sql',
        '.github/workflows/ci-cd.yml'
      ];
      
      const missing = requiredFiles.filter(file => !fs.existsSync(file));
      if (missing.length > 0) {
        throw new Error(`Отсутствуют файлы: ${missing.join(', ')}`);
      }
      return '✅ Все необходимые файлы присутствуют';
    }
  },
  {
    name: 'Next.js зависимости',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('nextjs-starter/package.json', 'utf8'));
      const requiredDeps = [
        '@once-ui-system/core',
        '@supabase/supabase-js',
        '@twa-dev/sdk',
        'next',
        'react',
        'react-dom'
      ];
      
      const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
      if (missing.length > 0) {
        throw new Error(`Отсутствуют зависимости: ${missing.join(', ')}`);
      }
      return '✅ Все зависимости Next.js установлены';
    }
  },
  {
    name: 'Telegram bot зависимости',
    check: () => {
      const packageJson = JSON.parse(fs.readFileSync('telegram-bot/package.json', 'utf8'));
      const requiredDeps = ['grammy', '@supabase/supabase-js', 'dotenv'];
      
      const missing = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
      if (missing.length > 0) {
        throw new Error(`Отсутствуют зависимости бота: ${missing.join(', ')}`);
      }
      return '✅ Все зависимости Telegram bot установлены';
    }
  },
  {
    name: 'Vercel конфигурация',
    check: () => {
      const vercelConfig = JSON.parse(fs.readFileSync('nextjs-starter/vercel.json', 'utf8'));
      if (!vercelConfig.name || !vercelConfig.env) {
        throw new Error('Неполная конфигурация Vercel');
      }
      return '✅ Vercel конфигурация корректна';
    }
  },
  {
    name: 'GitHub Actions',
    check: () => {
      const workflow = fs.readFileSync('.github/workflows/ci-cd.yml', 'utf8');
      if (!workflow.includes('vercel-action') || !workflow.includes('VERCEL_TOKEN')) {
        throw new Error('Некорректная конфигурация GitHub Actions');
      }
      return '✅ GitHub Actions workflow настроен';
    }
  },
  {
    name: 'Supabase схема',
    check: () => {
      const schema = fs.readFileSync('infra/supabase/schema.sql', 'utf8');
      const requiredTables = ['users', 'elements', 'missions', 'user_artifacts'];
      
      const missing = requiredTables.filter(table => {
        const upperCase = `CREATE TABLE ${table}`;
        const lowerCase = `create table ${table}`;
        return !schema.includes(upperCase) && !schema.includes(lowerCase);
      });
      if (missing.length > 0) {
        throw new Error(`Отсутствуют таблицы: ${missing.join(', ')}`);
      }
      return '✅ Supabase схема содержит все необходимые таблицы';
    }
  },
  {
    name: 'Environment файлы',
    check: () => {
      const envExample = fs.existsSync('nextjs-starter/env.example');
      const botEnvExample = fs.existsSync('telegram-bot/env.example');
      
      if (!envExample || !botEnvExample) {
        throw new Error('Отсутствуют example файлы переменных среды');
      }
      return '✅ Environment example файлы созданы';
    }
  }
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  try {
    console.log(`🔍 ${check.name}:`);
    const result = check.check();
    console.log(`   ${result}\n`);
    passed++;
  } catch (error) {
    console.log(`   ❌ ${error.message}\n`);
    failed++;
  }
}

console.log('📊 Результаты проверки:');
console.log(`✅ Пройдено: ${passed}`);
console.log(`❌ Не пройдено: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 Проект готов к развертыванию!');
  console.log('📋 Следующие шаги:');
  console.log('1. git add . && git commit -m "Deploy ready"');
  console.log('2. git push origin main');
  console.log('3. Настройте Vercel проект');
  console.log('4. Добавьте переменные среды');
  console.log('5. Создайте Telegram бота');
  console.log('\n📖 Подробная инструкция в DEPLOYMENT.md');
} else {
  console.log('\n⚠️  Проект не готов к развертыванию.');
  console.log('Устраните ошибки и запустите проверку снова.');
  process.exit(1);
} 