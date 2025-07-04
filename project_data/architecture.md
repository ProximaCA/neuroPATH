I'll answer as a world-famous архитектор цифровых платформ и практик DDD в сфере менталхелс, лауреат *Gartner Mindtech Architecture Award*.

---

**TL;DR:** Ниже — **чёткая архитектура проекта "Алхимия Разума: Вода" по Domain-Driven Design (DDD)**, под твою технологическую карту: TMA + React + Supabase + Node.js бот.

---

## 🧠 **DOMAIN-DRIVEN DESIGN: Алхимия Разума / Вода**

---

### **1. CORE DOMAIN: mental\_journey**

> Главная ценность — трансформация пользователя через прохождение архетипных миссий и медитаций. Всё строится вокруг *состояния психики и прогресса души*, а не вокруг медитаций как "аудиофайлов".

---

## 🧩 BOUNDED CONTEXTS (4 ключевых блока):

### ✅ 1. **UserContext**

**Отвечает за:** пользователя, прогресс, текущую стихию, очки, сессии.

#### Entities:

* `User` — id, telegram\_id, текущая\_стихия, уровень\_глубины, инвентарь
* `Session` — id, user\_id, миссия\_id, дата, длительность, результат

#### Services:

* `UserProgressService`
* `ReturnToFormStrategy` (алгоритм возвращения после перерыва)

---

### 🎧 2. **PracticeContext**

**Отвечает за:** медитации, их типы, связанные архетипы, треки.

#### Entities:

* `Practice` — id, название, тип (медитация / дыхание / сеанс), файл\_id, стихия\_id
* `Archetype` — название, голос, паттерн поведения

#### Services:

* `PracticeRecommenderService` — AI-логика подбора
* `MeditationScheduler`

---

### 🔥 3. **ElementContext**

**Отвечает за:** стихийную логику, уровни, миссии.

#### Entities:

* `Element` — id (вода, огонь…), имя, цвет, символ
* `Mission` — id, element\_id, тип, текст, условия, артефакт\_id
* `Artifact` — id, название, эффект, UI\_иконка

#### Services:

* `MissionRunner`
* `ElementalLogicEngine` — связывает поведение с архетипом и состоянием

---

### 🤖 4. **BotContext**

**Отвечает за:** Telegram-интеграцию, голос, комманды, аудио-бота.

#### Entities:

* `BotSession` — id, user\_id, текущее\_состояние, current\_command
* `VoiceTrack` — id, файл, язык, стиль (проводник, мантра…)

#### Services:

* `TelegrafBotService`
* `AudioDeliveryService`

---

## ⚙️ ТЕХНИЧЕСКАЯ СХЕМА (ОБНОВЛЕНО)

```
nextjs-starter/          # Next.js приложение (Once UI)
  ├─ src/app/           # App Router страницы
  ├─ src/components/    # UI компоненты
  └─ public/            # Статичные файлы
aigrambot/              # Telegram бот (отдельный проект)
  ├─ src/               # Логика бота
  ├─ audio/             # Медитации и треки
  └─ config/            # Настройки
infra/
  ├─ supabase/          # SQL + Policies + RPC-функции
  └─ deployment/        # Vercel + Railway/Render
```

---

## 🗂️ DATABASE DESIGN (Supabase)

### Таблицы:

* `users`
* `sessions`
* `elements`
* `missions`
* `artifacts`
* `practices`
* `bot_sessions`
* `voice_tracks`

> Дополнительно: хранение аудио через Supabase Storage (`public/audio/`)

---

## 🧠 СТРАТЕГИЯ MVP / TMA

1. **Диагностика** (React-игра) → записываем состояние и выбираем стихию "Вода".
2. **Страница: Миссия 1 — Погружение**

   * Кнопка “Начать” → вызов телеграм-бота с сессией.
3. **Завершение медитации** → инкремент очков и артефакт.
4. **Бонус**: можно “послать свет другу”.

---
