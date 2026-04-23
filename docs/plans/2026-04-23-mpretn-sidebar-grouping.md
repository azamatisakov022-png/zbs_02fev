# MPRETN Sidebar Grouping — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Преобразовать плоский сайдбар сотрудника МПРЭТН (14 пунктов) в 4 логические секции с текстовыми заголовками + убрать пункт «Выявленные компании».

**Architecture:** Минимально-инвазивный подход — расширяем интерфейс `MenuItem` двумя опциональными полями (`groupTitle?`, `groupDivider?`). Другие роли (admin, business, eco-operator) НЕ трогаем — они продолжают работать на том же коде. Только `useEmployeeMenu` начинает проставлять `groupTitle` у пунктов, открывающих новую секцию. Шаблон в `DashboardLayout.vue` получает условный рендер заголовка/линии перед item.

**Tech Stack:** Vue 3 + TypeScript, `vue-i18n` (ru/ky/en), Tailwind CSS inline, Pinia-like reactive stores.

**Design reference:** `docs/plans/2026-04-23-mpretn-sidebar-grouping-design.md` (утверждённый дизайн).

**Working directory:** `C:/Projects/zbs_02fev/` on `main` branch (NO worktrees — per user policy).

---

## Pre-Flight Check

**Step 0: Verify start state**

Run from `C:/Projects/zbs_02fev/`:
```bash
git status --short | head -5
git branch --show-current
git worktree list
```

Expected:
- Current branch: `main`
- `git worktree list` shows ONLY `C:/Projects/zbs_02fev` (no `.claude/worktrees/*`)
- `git status` may show many modified/untracked files from user's ongoing work — that's OK, we won't touch them

**If not on main or worktrees exist — STOP and consolidate first.**

---

## Task 1: Add section title i18n keys (ru/ky/en)

**Files:**
- Modify: `frontend/src/locales/ru.json` (around line 150 — `nav.employee` block)
- Modify: `frontend/src/locales/ky.json` (find same `nav.employee` block)
- Modify: `frontend/src/locales/en.json` (find same `nav.employee` block)

**Step 1.1: Add `sections` sub-block to `nav.employee` in `ru.json`**

In `ru.json`, find the `nav.employee` object (around line 150). Add a nested `sections` object right after the existing `audit` key (before the closing `}`):

```jsonc
// Inside "nav": { "employee": { ... existing keys ..., 
      "audit": "Журнал действий",
      "sections": {
        "applications": "Заявления и обращения",
        "registries": "Реестры",
        "analytics": "Аналитика",
        "system": "Система"
      }
    },
```

**Step 1.2: Add same structure to `ky.json` with Kyrgyz translations**

```jsonc
      "sections": {
        "applications": "Арыздар жана кайрылуулар",
        "registries": "Реестрлер",
        "analytics": "Аналитика",
        "system": "Система"
      }
```

**Step 1.3: Add same structure to `en.json` with English translations**

```jsonc
      "sections": {
        "applications": "Applications and Appeals",
        "registries": "Registries",
        "analytics": "Analytics",
        "system": "System"
      }
```

**Step 1.4: Verify JSON is valid**

Run:
```bash
cd /c/Projects/zbs_02fev/frontend && node -e "JSON.parse(require('fs').readFileSync('src/locales/ru.json')); JSON.parse(require('fs').readFileSync('src/locales/ky.json')); JSON.parse(require('fs').readFileSync('src/locales/en.json')); console.log('OK')"
```

Expected output: `OK`. If not — JSON syntax error (missing comma, etc.) — fix before proceeding.

**Step 1.5: Commit**

```bash
git add frontend/src/locales/ru.json frontend/src/locales/ky.json frontend/src/locales/en.json
git commit -m "i18n(employee): add sidebar section titles (applications/registries/analytics/system)

Подготовка к группировке сайдбара сотрудника МПРЭТН.
Никаких UI-изменений ещё не видно."
```

---

## Task 2: Extend MenuItem interface

**Files:**
- Modify: `frontend/src/components/dashboard/DashboardLayout.vue:11-17` (interface definition)

**Step 2.1: Add two optional fields to the `MenuItem` interface**

In `DashboardLayout.vue`, find the `MenuItem` interface (starts at line 11) and extend it:

```ts
interface MenuItem {
  id: string
  label: string
  icon: string
  route: string
  badge?: number
  /** Если задан — перед этим пунктом отрисовать заголовок секции (UPPERCASE, мелкий, серый). */
  groupTitle?: string
  /** Если true — перед этим пунктом отрисовать тонкую горизонтальную линию (для отделения нижнего блока). */
  groupDivider?: boolean
}
```

**Step 2.2: Type-check**

Run:
```bash
cd /c/Projects/zbs_02fev/frontend && npx vue-tsc --noEmit 2>&1 | tail -20
```

Expected: no errors related to `MenuItem` or `DashboardLayout.vue`. There may be pre-existing errors in other files — ignore those.

**Step 2.3: Commit**

```bash
git add frontend/src/components/dashboard/DashboardLayout.vue
git commit -m "refactor(sidebar): extend MenuItem interface with groupTitle/groupDivider

Подготовка к группировке — поля опциональные, все 4 роли продолжают работать
без изменений."
```

---

## Task 3: Update DashboardLayout template to render group headers + dividers

**Files:**
- Modify: `frontend/src/components/dashboard/DashboardLayout.vue` (template section, around lines 177-197)

**Step 3.1: Wrap the nav button in a `<template v-for>` with conditional header/divider**

Replace the current `<button v-for="item in menuItems">` (lines ~177-197) with:

```vue
<template v-for="item in menuItems" :key="item.id">
  <!-- Тонкая горизонтальная линия (используется для отделения нижнего блока Уведомления+Профиль) -->
  <hr
    v-if="item.groupDivider"
    class="my-2 mx-4 border-0 border-t border-[rgba(0,0,0,0.08)]"
    aria-hidden="true"
  />
  <!-- Заголовок секции (UPPERCASE, мелкий, серый, некликабельный) -->
  <div
    v-if="item.groupTitle"
    class="px-4 pt-3 pb-1 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider select-none"
  >
    {{ item.groupTitle }}
  </div>
  <!-- Основной пункт меню (оставляем как было) -->
  <button
    @click="navigateTo(item.route)"
    :class="[
      'nav-item w-full flex items-center gap-3 px-4 py-3 text-left transition-all',
      isActive(item.route)
        ? 'nav-item-active bg-[rgba(45,139,78,0.12)] text-[#2D8B4E] font-semibold border-l-[3px] border-[#2D8B4E]'
        : 'text-[#4B5563] hover:bg-[rgba(45,139,78,0.06)] hover:text-[#2D8B4E] border-l-[3px] border-transparent'
    ]"
    style="border-radius: var(--radius-sm)"
    :aria-current="isActive(item.route) ? 'page' : undefined"
  >
    <span class="nav-icon w-6 h-6 flex items-center justify-center transition-transform" v-html="item.icon" aria-hidden="true"></span>
    <span class="text-[15px]">{{ item.label }}</span>
    <span
      v-if="item.badge && item.badge > 0"
      class="badge badge-danger ml-auto text-[10px] px-1.5 py-0.5"
      :aria-label="t('notifications.unreadCount', { count: item.badge })"
    >{{ item.badge }}</span>
  </button>
</template>
```

**Step 3.2: Type-check**

```bash
cd /c/Projects/zbs_02fev/frontend && npx vue-tsc --noEmit 2>&1 | tail -20
```

Expected: no new errors.

**Step 3.3: Visual sanity check — no functional regression for other roles**

Start dev server (if not running):
```bash
cd /c/Projects/zbs_02fev/frontend && npm run dev
```

In browser, log in as BUSINESS / ECO-OPERATOR / ADMIN — verify sidebar looks **unchanged** (no headers, no dividers, same flat list). This confirms backward compatibility.

**Step 3.4: Commit**

```bash
git add frontend/src/components/dashboard/DashboardLayout.vue
git commit -m "feat(sidebar): render group headers and dividers in DashboardLayout

Добавлен условный рендер <div> заголовка секции и <hr> разделителя перед
пунктами меню, у которых заданы groupTitle / groupDivider.

Другие роли (не employee) не используют эти поля — сайдбар у них остаётся
прежним."
```

---

## Task 4: Update useEmployeeMenu to add groups + remove detected-companies

**Files:**
- Modify: `frontend/src/composables/useRoleMenu.ts:144-164` (`useEmployeeMenu` function)

**Step 4.1: Replace the `menuItems` array in `useEmployeeMenu`**

Current code (lines ~147-162):
```ts
const menuItems = computed(() => [
  { id: 'dashboard', ... route: '/employee' },
  { id: 'notifications', ... },
  { id: 'analytics', ... },
  { id: 'compliance', ... },
  { id: 'licenses', ... },
  { id: 'waste-types', ... },
  { id: 'landfills-tbo', ... },
  { id: 'collection-points', ... },
  { id: 'feedback', ... },
  { id: 'reports', ... },
  { id: 'detected-companies', ... },  // <-- УДАЛЯЕМ
  { id: 'audit', ... },
  { id: 'map', ... },
  { id: 'profile', ... },
])
```

Replace with (new order + groupTitle + groupDivider, `detected-companies` removed):

```ts
const menuItems = computed(() => [
  // Верх: Главная
  { id: 'dashboard', label: t('nav.employee.dashboard'), icon: icons.dashboard, route: '/employee' },

  // Секция: Заявления и обращения
  { id: 'licenses', label: t('nav.employee.licenses'), icon: icons.license, route: '/employee/licenses', groupTitle: t('nav.employee.sections.applications') },
  { id: 'feedback', label: t('nav.employee.feedback'), icon: icons.feedback, route: '/employee/feedback', badge: feedbackStore.getNewCount() },
  { id: 'compliance', label: t('nav.employee.compliance'), icon: icons.compliance, route: '/employee/compliance' },

  // Секция: Реестры
  { id: 'landfills-tbo', label: t('nav.employee.landfillsTbo'), icon: icons.landfill, route: '/ministry/landfills', groupTitle: t('nav.employee.sections.registries') },
  { id: 'collection-points', label: t('nav.employee.collectionPoints'), icon: icons.landfill, route: '/ministry/collection-points' },
  { id: 'waste-types', label: t('nav.employee.wasteTypes'), icon: icons.recycle, route: '/employee/waste-types' },

  // Секция: Аналитика
  { id: 'analytics', label: t('nav.employee.analytics'), icon: icons.analytics, route: '/ministry/analytics', groupTitle: t('nav.employee.sections.analytics') },
  { id: 'reports', label: t('nav.employee.reports'), icon: icons.report, route: '/employee/reports' },
  { id: 'map', label: t('nav.employee.map'), icon: icons.map, route: '/employee/map' },

  // Секция: Система
  { id: 'audit', label: t('nav.employee.audit'), icon: icons.audit, route: '/employee/audit', groupTitle: t('nav.employee.sections.system') },

  // Нижний блок (отделён линией, без текстового заголовка)
  { id: 'notifications', label: t('notifications.title'), icon: icons.notification, route: '/employee/notifications', badge: notificationStore.getUnreadCount('employee'), groupDivider: true },
  { id: 'profile', label: t('nav.employee.profile'), icon: icons.profile, route: '/employee/profile' },
])
```

**Checklist** (проверить глазами перед сохранением):
- [ ] 13 пунктов (было 14, минус `detected-companies`)
- [ ] 4 пункта с `groupTitle` (licenses, landfills-tbo, analytics, audit)
- [ ] 1 пункт с `groupDivider: true` (notifications)
- [ ] Все существующие `id`, `route`, `icon`, `badge` сохранены без изменений
- [ ] Пункт `detected-companies` удалён (страница и маршрут остаются нетронутыми)

**Step 4.2: Type-check**

```bash
cd /c/Projects/zbs_02fev/frontend && npx vue-tsc --noEmit 2>&1 | tail -20
```

Expected: no errors.

**Step 4.3: Visual verification**

Start dev server (if not running): `cd /c/Projects/zbs_02fev/frontend && npm run dev`

Log in as **employee** (МПРЭТН сотрудник) — например `employee@mail.ru` / соответствующий пароль из seed-данных. В сайдбаре должно быть:

```
🏠 Главная

ЗАЯВЛЕНИЯ И ОБРАЩЕНИЯ   ← серый UPPERCASE заголовок
📄 Лицензии
💬 Обращения граждан      [бейдж если есть]
✅ Контроль исполнения

РЕЕСТРЫ
🗑️ Полигоны ТБО
📍 Пункты приёма
♻️ Виды отходов

АНАЛИТИКА
📊 Аналитика
📑 Отчётность
🗺️ ГИС-карта

СИСТЕМА
📋 Журнал действий

─────────                 ← тонкая линия
🔔 Уведомления    [3]
👤 Мой профиль
```

Проверить:
- [ ] Все заголовки секций UPPERCASE, серые, НЕ кликабельные (курсор не меняется на pointer)
- [ ] Пункт «Выявленные компании» отсутствует
- [ ] Клик по каждому пункту ведёт на правильный маршрут
- [ ] Активный пункт подсвечивается (зелёная полоска слева)
- [ ] Бейдж уведомлений отображается если есть непрочитанные
- [ ] Переключение языка (RU/KY/EN) меняет текст заголовков секций
- [ ] На мобильном (resize браузер до <1024px) сайдбар открывается/закрывается корректно, структура сохраняется

**Если что-то сломано — чинить в этом таске, не переходить к следующему шагу.**

**Step 4.4: Commit**

```bash
git add frontend/src/composables/useRoleMenu.ts
git commit -m "feat(sidebar): группировка сайдбара сотрудника МПРЭТН в 4 секции

Пункты сгруппированы по смыслу:
- Заявления и обращения (Лицензии, Обращения граждан, Контроль исполнения)
- Реестры (Полигоны ТБО, Пункты приёма, Виды отходов)
- Аналитика (Дашборд, Отчётность, ГИС-карта)
- Система (Журнал действий)

Нижний блок (Уведомления + Профиль) отделён тонкой линией.

Пункт «Выявленные компании» удалён из сайдбара (маршрут и страница
остаются доступными по прямой ссылке).

Закрывает дизайн из docs/plans/2026-04-23-mpretn-sidebar-grouping-design.md"
```

---

## Task 5: Final verification

**Step 5.1: Full regression — все роли**

Последовательно войти под каждой ролью и убедиться что сайдбар отображается корректно:

| Роль | Ожидание |
|---|---|
| **employee** | Новый сгруппированный сайдбар (4 секции + низ) |
| **admin** | Сайдбар без изменений (плоский список) |
| **eco-operator** | Сайдбар без изменений (плоский список) |
| **business (payer)** | Сайдбар без изменений |
| **business (applicant)** | Сайдбар без изменений, CTA «Подать новую заявку» на месте |

**Step 5.2: Быстрая проверка Git-истории**

```bash
git log --oneline main -5
```

Должны увидеть 4 коммита от этого плана (по одному на Task 1-4) + предыдущие. Все на `main`, никаких веток.

**Step 5.3: Обновить статус дизайн-дока**

Открыть `docs/plans/2026-04-23-mpretn-sidebar-grouping-design.md` и в первых строках изменить:

```diff
- **Статус:** Утверждён, готов к имплементации
+ **Статус:** Реализовано 2026-04-23 (коммиты: <sha1>, <sha2>, <sha3>, <sha4>)
```

Где `<sha1..4>` — хэши коммитов из Task 1-4 (получить через `git log --oneline -10`).

```bash
git add docs/plans/2026-04-23-mpretn-sidebar-grouping-design.md
git commit -m "docs(plans): mark sidebar grouping design as implemented"
```

---

## Rollback plan (если что-то пойдёт не так)

Все изменения — отдельными коммитами. Откатить можно:

```bash
# Посмотреть 5 последних коммитов
git log --oneline -5

# Откатить последний коммит (сохранив изменения в рабочем дереве)
git reset --soft HEAD~1

# Или полностью откатить до состояния ДО плана
git reset --hard <sha-коммита-перед-Task-1>
```

⚠️ **ВНИМАНИЕ:** пользователь имеет ~28 несохранённых файлов в рабочем дереве на момент начала плана. Никогда не делать `git reset --hard` без подтверждения — это потеряет его работу. Вместо этого использовать `git revert <sha>` для безопасного отката конкретного коммита.

---

## Definition of Done

- [ ] Task 1 закоммичен — i18n ключи добавлены в ru/ky/en
- [ ] Task 2 закоммичен — интерфейс расширен
- [ ] Task 3 закоммичен — шаблон Layout рендерит заголовки и линии
- [ ] Task 4 закоммичен — useEmployeeMenu выдаёт группы, detected-companies убран
- [ ] Task 5 — все 5 ролей проверены в браузере, регрессий нет
- [ ] Дизайн-док помечен как реализованный
- [ ] `git status --short` показывает только исходные 28 файлов пользователя (наших изменений там нет — всё в коммитах)

---

## Known limitations (not in scope)

- Перенос «Уведомлений» и «Профиля» в header-панель (dropdown) — отложено
- Унификация путей `/ministry/*` → `/employee/*` — отложено
- Переделка дашборда (виджеты, KPI, Quick Actions) — отложено

Эти пункты — в разделе «Дальнейшие шаги» дизайн-дока.
