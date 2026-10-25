# Ревью проекта и план актуализации — 2026-10-25

Ревью выполнено на коммите `e3cbb60` (main, после серии Dependabot-мержей:
Next 16.2.10 → 16.4.1, postcss, qs, nanoid, js-yaml, browserslist,
source-map-js). Проверены: код `app/`, `lib/`, `components/`, тесты, CI,
конфиги, lockfile. Прогнаны lint, tsc, prettier, unit-тесты с coverage,
production-сборка на фикстурном каталоге, E2E smoke, `npm audit`,
`npm outdated`. Для сравнения та же сборка прогнана на коммите `adf5aa3`
(до бампов) во временном worktree.

## 1. Что сломалось после обновления

**Падает не набор тестов, а production-сборка.** `next build` на 16.4.1
останавливается на шаге «Running TypeScript» с 13 ошибками типов. Все 13
ошибок находятся в тестовых файлах, не в коде приложения, и все они были и
раньше: `tsc --noEmit` на 16.2.10 выдаёт те же 13 ошибок. Разница в том, что
`next build` 16.2.10 их пропускал («Finished TypeScript»), а 16.4.1 проверяет
весь `include` из `tsconfig.json`, куда входят `tests/**`.

Ошибки (все в `tests/`):

| Файл                            | Строки | Суть                                                                             |
| ------------------------------- | ------ | -------------------------------------------------------------------------------- |
| `tests/layout-head.test.tsx`    | 45, 47 | `body.props` типизирован как `unknown` (React 19 `ReactElement<unknown>`)        |
| `tests/products-pages.test.tsx` | 156    | индекс `[0]` на `OGImage \| OGImage[]`                                           |
| `tests/robots-sitemap.test.ts`  | 38, 61 | индекс `[0]` на `rules` (объект или массив); `lastModified` это `string \| Date` |
| `tests/stripe-server.test.ts`   | 28     | каст мока `unstable_cache` к generic `T`                                         |
| `tests/ui-sonner.test.tsx`      | 34, 35 | `ToasterProps` в моке объявлен как `Record<string, unknown>`                     |
| `tests/use-toast.test.ts`       | 8–13   | `.mockClear()` на типе sonner, а не на `vi.fn()`                                 |

Почему это не поймали раньше: в CI нет шага `tsc --noEmit`, нет шага
`npm run build`, нет `prettier --check`. Dependabot-PR мержились по зелёным
unit/E2E, которые типы не проверяют (Vitest транспилирует без typecheck,
E2E ходит на `next dev`).

Побочное: локальная `node_modules` была от 21 июля (Next 16.2.10), то есть
локальные прогоны шли не на тех версиях, что в lockfile. В рамках ревью
выполнен `npm ci`; после мержа PR #26 (source-map-js) lockfile снова на одну
patch-версию впереди, нужен ещё один `npm ci`.

## 2. Состояние гейтов на 2026-10-25 (после `npm ci`)

| Гейт                                 | Результат                                                                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `eslint`                             | чисто                                                                                                             |
| `tsc --noEmit`                       | 13 ошибок, все в `tests/`                                                                                         |
| `prettier --check .`                 | 11 файлов не отформатированы                                                                                      |
| `vitest --run`                       | 37 файлов, 157 тестов, все проходят                                                                               |
| coverage                             | lines 91.9%, statements 91.7%, functions 92.7%, branches 79.1%                                                    |
| `npm run build` (fixture)            | **падает** на type-check                                                                                          |
| E2E smoke (cart, not-found, success) | 4/4 проходят на `next dev`                                                                                        |
| `npm audit --omit=dev`               | **1 high**: `zod < 4.6.6` (GHSA-mrhx-c7xc-m3w5), стоит 4.2.1                                                      |
| `npm audit` (полный)                 | 3 high, 3 moderate: zod, brace-expansion, vite 8.1.x, @vitest/mocker; все закрываются `npm audit fix` без мажоров |

Предупреждения сборки: «The Edge Runtime is deprecated» из-за
`export const runtime = "edge"` в `app/opengraph-image.tsx`. Vitest пишет
«Both esbuild and oxc options were set» из-за устаревшего `esbuild.jsx` в
`vitest.config.ts`.

## 3. Что закрыто по старым ревью

### SECURITY_REVIEW_2026-07-11.md

| Находка                                 | Статус                       | Подтверждение в коде                                                                                     |
| --------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Уязвимый Next.js                        | закрыто, но см. п. 4.2       | lockfile 16.4.1; latest 16.4.3                                                                           |
| Checkout принимает любой активный price | закрыто                      | `getProductByPriceId` ищет только в снапшоте sellable-каталога                                           |
| Чек доступен любому с Session ID        | закрыто                      | HMAC-proof в HttpOnly cookie, `verifyReceiptProof` до вызова Stripe                                      |
| DoS-контроли обходимы                   | закрыто в рамках pet-проекта | лимит корзины 10, провайдерские IP-заголовки, глобальный бюджет Stripe-вызовов, стриминговое чтение тела |
| Глобальные промокоды                    | закрыто                      | `allow_promotion_codes: false`                                                                           |
| PII в логах                             | закрыто                      | `serializeServerError` с allow-list, email и сообщения не логируются                                     |
| `qs` в уязвимом диапазоне               | закрыто, остался хвост       | прямая зависимость `qs` 6.16.0 только ради переопределения транзитивной (см. 4.3)                        |
| Follow-up: edge/WAF rate-limit          | открыт, осознанно отложен    | `.env.example` и README это фиксируют                                                                    |
| Follow-up: PostCSS advisory             | снят                         | в Next 16.4.1 postcss 8.5.23 ≥ 8.5.10, audit его больше не показывает                                    |

### PROJECT_IMPROVEMENT_PLAN.md (11 пунктов)

Все 11 пунктов отмечены выполненными 2026-07-21, код это подтверждает:
`CatalogueRepository` + снапшот с индексами, инвариант `SellableProduct`,
единая валюта, per-session receipt proof, Postgres `OrderStore` с атомарным
CTE и outbox, фикстурный каталог для CI, read-only workflows, CSP/HSTS,
типизированные профили конфигурации. Остаются два внешних условия, которые
код не решает: production `DATABASE_URL` (п. 8) и edge-лимит (п. 2).

### BACKLOG.md (локальный, не в git)

Пункт про O(cards × cart_items) в `ProductCard` открыт. При каталоге в
десятки позиций это не проблема; включён в план как необязательный S.

## 4. Новые находки

### 4.1 Сборка, типы, форматирование

- 13 ошибок типов в тестах блокируют `next build` (раздел 1).
- `prettier --check` красный на 11 файлах, включая исходники
  (`app/api/stripe/webhook/route.ts`, `lib/stripe.ts`, `lib/config/env.ts`,
  `components/product-card.tsx` и др.).
- В `vitest.config.ts` опция `esbuild.jsx` игнорируется Vitest 4 (oxc).
- `tsconfig.json` включает `tests/**` в один проект с приложением, поэтому
  любая ошибка в тесте валит production-сборку.

### 4.2 Зависимости и рантайм

- `zod` 4.2.1 имеет high advisory в production-зависимостях. Фикс 4.6.7,
  minor, без breaking changes для используемого API.
- `next` 16.4.1, latest 16.4.3; `eslint-config-next` 16.0.10 отстаёт от Next
  на четыре minor-версии, его нужно держать синхронно с `next`.
- Node 20 достиг EOL 2026-04-30. CI (`node-version: 20`), бейдж в README и
  `@types/node ^20` всё ещё на 20. Локально Node 24.18. Next 16.4 требует
  ≥ 20.9, Vitest 5 и jsdom 30 уже требуют ≥ 22.12. В `package.json` нет
  `engines`, нет `.nvmrc`.
- `stripe` SDK 18.5.0 при `apiVersion: "2026-01-28.clover" as LatestApiVersion`:
  типы SDK описывают API `2025-08-27.basil`, а запросы идут на `clover`.
  Каст маскирует расхождение типов и реального ответа. Latest SDK 23.0.1,
  это пять мажоров, менять нужно отдельной задачей.
- `@stripe/stripe-js` используется только ради `redirectToCheckout`. Stripe
  рекомендует редирект на `session.url`, который сервер уже получает; тогда
  Stripe.js на клиенте, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` и часть CSP
  (`js.stripe.com` в `script-src`/`frame-src`) становятся не нужны.
- Прямые зависимости без использования в коде: `@eslint/eslintrc` (flat
  config его не импортирует), `baseline-browser-mapping` (транзитивная
  browserslist/next), `qs` (транзитивная stripe). Добавлены как
  workaround'ы для audit; правильнее перенести в `overrides` или удалить.
- Dependabot работает только по security-алертам: нет
  `.github/dependabot.yml`, поэтому бампы приходят по одному и без
  группировки, а обычные обновления не приходят вообще.
- `npm outdated`: minor-обновления ждут у 30 пакетов; мажоры доступны у
  vitest 5, eslint 10, jsdom 30, typescript 7, lucide-react 1, @types/node 26,
  @hookform/resolvers 6, @testing-library/jest-dom 7. Мажоры в этот план не
  входят.

### 4.3 Next.js 16.4: устаревшие конвенции в коде

- `app/opengraph-image.tsx`: `runtime = "edge"` deprecated, Next просит
  убрать экспорт (Node.js runtime для `ImageResponse` поддерживается).
- `app/head.tsx`: файл `head.js` не является конвенцией App Router с
  Next 13.x, Next его не рендерит. Preconnect/dns-prefetch нужно перенести в
  `app/layout.tsx` через `ReactDOM.preconnect` / `ReactDOM.prefetchDNS`,
  тест `tests/layout-head.test.tsx` переписать.
- `app/success/page.tsx`: `redirect("/cart")` вызывается внутри `try`,
  `catch` перехватывает `NEXT_REDIRECT`, логирует его как ошибку Stripe и
  делает повторный `redirect`. Работает, но пишет ложную запись в лог на
  каждый неоплаченный заказ. Нужен `unstable_rethrow` из `next/navigation`
  или вынос `redirect` за `try`.
- `await Promise.resolve(headers())` / `cookies()` в route handlers и
  success-странице: в Next 16 это просто `await headers()`.
- `lib/stripe.ts`: `unstable_cache` ещё работает, но является legacy API;
  миграция на Cache Components (`'use cache'` + `cacheLife`) требует
  `cacheComponents: true` и выходит за рамки базового рефакторинга.
  Оставить, зафиксировать как осознанное решение.
- Базовый URL сайта читается напрямую из `process.env.NEXT_PUBLIC_SITE_URL`
  в четырёх местах (`app/layout.tsx`, `app/products/page.tsx`,
  `app/products/[slug]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`) в обход
  `readPublicConfig()`.
- `z.string().email()` в `app/api/checkout/route.ts` и
  `components/cart/checkout-form.tsx` работает, но в Zod 4 помечен
  deprecated в пользу `z.email()`.

### 4.4 CI

- Нет шагов `tsc --noEmit`, `npm run lint`, `prettier --check`, `npm run build`
  ни в одном workflow. Именно поэтому сломанная сборка дошла до main.
- `npm audit --omit=dev --audit-level=high` сейчас красный из-за zod, то есть
  Security Checks на main уже должен падать.
- E2E гоняются против `next dev`, а не против production-сборки, поэтому
  регрессии сборки и статической генерации E2E не видят.
- `playwright.config.ts`: обе ветки тернарника `webServer.command`
  одинаковы.
- GitHub Actions подключены по мажорным тегам (`@v4`, `@v5`, `@v2`) без
  pin по SHA; для репозитория с `contents: write` в publish-badges это
  слабое место supply chain.
- `TESTING.md` декларирует пороги покрытия 60/60/50/50, но в
  `vitest.config.ts` нет `coverage.thresholds`, гейт ничего не проверяет.

### 4.5 Гигиена репозитория

- `.DS_Store` закоммичен в корне, хотя есть в `.gitignore`.
- README: бейдж Next.js 16.2.10, бейдж Node 20.x.
- `components.json` (shadcn) описывает Tailwind-конфиг, которого в проекте
  нет: компоненты на CSS Modules. Файл мёртвый.
- `vitest.config.ts` исключает из coverage несуществующий `postcss.config.mjs`.
- `AGENTS.md` появился в рабочем дереве: его генерирует `next dev` 16.4. Нужно
  решить: закоммитить или добавить в `.gitignore` (Next будет пересоздавать).
- `components/cart/cart-page-client.tsx`: `items[0]?.currency ?? "USD"`
  дублирует `STOREFRONT_CURRENCY`.

### 4.6 Что в этот план не входит (сложные доработки)

- Общий rate-limit (Vercel Firewall / Upstash) для multi-instance.
- Nonce-based CSP вместо `'unsafe-inline'` в `script-src` (нужен proxy и
  прокидывание nonce в layout).
- Миграция `unstable_cache` на Cache Components.
- Мажорные обновления: Stripe SDK 18 → 23, Vitest 5, ESLint 10, TypeScript 7,
  jsdom 30, lucide-react 1.
- Схема БД через миграции вместо `CREATE TABLE IF NOT EXISTS` при старте.

## 5. План работ

Оценки: S до 1 часа, M 1–3 часа, L до дня. Каждый этап отдельным PR,
после каждого полный гейт из раздела 6.

### Этап 0. Починить сборку и закрыть high advisory (сегодня)

| #   | Задача                                                                                                                                                                                                                                                                                               | Файлы                                            | Оценка | Готово, когда                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| 0.1 | `npm ci`, чтобы локальная `node_modules` совпала с lockfile после PR #26                                                                                                                                                                                                                             | —                                                | S      | `node -p "require('next/package.json').version"` = 16.4.1                |
| 0.2 | Исправить 13 ошибок типов в тестах: сузить типы через `Array.isArray`/type guards, типизировать `ToasterProps` в `tests/test-utils/sonner.ts` через `ComponentProps<typeof Toaster>`, в `use-toast.test.ts` использовать `vi.mocked(sonnerToast)`, у мока `unstable_cache` вернуть `as unknown as T` | 6 тестовых файлов + `tests/test-utils/sonner.ts` | M      | `npx tsc --noEmit` без ошибок, `npm run build` проходит                  |
| 0.3 | `npm audit fix` (без `--force`): zod 4.6.7, vitest 4.1.12, vite 8.1.6+, brace-expansion. Проверить `git diff package-lock.json`, что мажоров нет                                                                                                                                                     | `package.json`, `package-lock.json`              | S      | `npm audit` без high/critical, 157 тестов зелёные                        |
| 0.4 | `npx prettier -w .` одним коммитом без правок логики                                                                                                                                                                                                                                                 | 11 файлов                                        | S      | `prettier --check .` чист                                                |
| 0.5 | Убрать `export const runtime = "edge"` из `app/opengraph-image.tsx`, обновить `tests/opengraph-image.test.ts` если он проверяет экспорт                                                                                                                                                              | `app/opengraph-image.tsx`                        | S      | build без предупреждения про Edge Runtime, `/opengraph-image` отдаёт PNG |

### Этап 1. CI, который ловит такие поломки (следующий PR)

| #   | Задача                                                                                                                                                                                       | Файлы                                                         | Оценка | Готово, когда                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| 1.1 | Добавить в `package.json` скрипты `typecheck` (`tsc --noEmit`), `format:check` (`prettier --check .`), `check` (lint + typecheck + format:check + test:unit --run)                           | `package.json`                                                | S      | `npm run check` локально зелёный                     |
| 1.2 | Новый workflow `quality.yml` (или шаги в `unit-tests.yml`): lint, typecheck, format:check, `npm run build` на `CATALOGUE_SOURCE=fixture`                                                     | `.github/workflows/`                                          | M      | PR с ошибкой типа в тесте краснеет                   |
| 1.3 | Перевести CI на Node 24 (actions/setup-node `node-version-file: .nvmrc`), добавить `.nvmrc` = 24, `engines.node ">=22.12"` в `package.json`, `@types/node` ^24, обновить бейдж Node в README | workflows, `.nvmrc`, `package.json`, `README.md`              | S      | все workflows на Node 24 зелёные                     |
| 1.4 | Добавить `.github/dependabot.yml`: npm weekly с группами `next` (next + eslint-config-next), `stripe`, `testing`, `lint`; отдельная секция `github-actions`                                  | `.github/dependabot.yml`                                      | S      | первый групповой PR от Dependabot                    |
| 1.5 | Пин actions по SHA с комментарием версии (`actions/checkout@<sha> # v4.x`)                                                                                                                   | 4 workflow-файла                                              | S      | все `uses:` на SHA                                   |
| 1.6 | E2E full (push в main) и publish-badges гонять против `npm run build && npm run start`, smoke на PR оставить на `next dev`; убрать одинаковый тернарник в `playwright.config.ts`             | `playwright.config.ts`, `e2e-tests.yml`, `publish-badges.yml` | M      | e2e-full проходит на production-сборке               |
| 1.7 | Включить `coverage.thresholds` в `vitest.config.ts`: lines 85, statements 85, functions 85, branches 70; синхронизировать `TESTING.md`                                                       | `vitest.config.ts`, `TESTING.md`                              | S      | `test:unit:coverage` падает при просадке ниже порога |

### Этап 2. Актуализация зависимостей без мажоров

| #   | Задача                                                                                                                                                                                                                                                                | Файлы                                                            | Оценка | Готово, когда                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ------ | ------------------------------------------------------ |
| 2.1 | `next` и `eslint-config-next` на 16.4.3 одной правкой; зафиксировать правило «версии совпадают» в README                                                                                                                                                              | `package.json`                                                   | S      | lint, build, тесты зелёные                             |
| 2.2 | `npm update` для minor/patch: react-hook-form, @hookform/resolvers 5.x, zustand, sonner, @radix-ui/_, @neondatabase/serverless, @playwright/test 1.64, @testing-library/_, prettier, tsx, @vitest/coverage-v8 4.1.x. Playwright: `npx playwright install` после бампа | `package.json`, lockfile                                         | M      | гейт зелёный, E2E smoke зелёный                        |
| 2.3 | Удалить прямые зависимости-workaround'ы: `@eslint/eslintrc`, `baseline-browser-mapping`; `qs` перенести из `dependencies` в `overrides` (или удалить, если транзитивная версия у stripe ≥ 6.16)                                                                       | `package.json`                                                   | S      | `npm ls qs` показывает только транзитивную, audit чист |
| 2.4 | Заменить `z.string().email()` на `z.email()` в route и форме                                                                                                                                                                                                          | `app/api/checkout/route.ts`, `components/cart/checkout-form.tsx` | S      | тесты валидации проходят                               |
| 2.5 | `vitest.config.ts`: убрать блок `esbuild`, убрать `postcss.config.mjs` из exclude                                                                                                                                                                                     | `vitest.config.ts`                                               | S      | предупреждение oxc/esbuild исчезло                     |

### Этап 3. Базовый рефакторинг под Next 16.4

| #   | Задача                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Файлы                                                                                                                                | Оценка | Готово, когда                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------ |
| 3.1 | Удалить `app/head.tsx`; preconnect/dns-prefetch для `files.stripe.com` и `images.unsplash.com` перенести в `app/layout.tsx` через `ReactDOM.preconnect`/`prefetchDNS`; переписать `tests/layout-head.test.tsx`                                                                                                                                                                                                                                           | `app/head.tsx`, `app/layout.tsx`, тест                                                                                               | S      | в HTML есть `<link rel="preconnect">`, тест зелёный                |
| 3.2 | `app/success/page.tsx`: вынести `redirect` за `try` или добавить `unstable_rethrow(error)` первой строкой `catch`; тест, что неоплаченная сессия не пишет `[server-error]`                                                                                                                                                                                                                                                                               | `app/success/page.tsx`, `tests/success-page.test.tsx`                                                                                | S      | в логе нет записей про NEXT_REDIRECT                               |
| 3.3 | Единый `getPublicSiteUrl()` в `lib/config/server.ts` (на базе `readPublicConfig`) вместо пяти прямых чтений `NEXT_PUBLIC_SITE_URL`; `metadataBase` в layout берёт его же                                                                                                                                                                                                                                                                                 | `app/layout.tsx`, `app/products/page.tsx`, `app/products/[slug]/page.tsx`, `app/sitemap.ts`, `app/robots.ts`, `lib/config/server.ts` | M      | один источник правды, тесты robots/sitemap/metadata зелёные        |
| 3.4 | `await headers()` / `await cookies()` вместо `await Promise.resolve(...)`                                                                                                                                                                                                                                                                                                                                                                                | `app/api/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `app/success/page.tsx`                                               | S      | тесты API зелёные                                                  |
| 3.5 | Checkout-редирект через `session.url`: сервер возвращает `{ sessionId, url }`, клиент делает `window.location.assign(url)`; удалить `lib/stripe-client.ts`, `@stripe/stripe-js`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` из env-схемы, `.env.example`, workflows и README; сузить CSP (`script-src`, `connect-src`, `frame-src` без js.stripe.com); обновить `tests/checkout-form.test.tsx`, `tests/stripe-client.test.ts`, `tests/security-config.test.ts` | route, `checkout-form.tsx`, `next.config.ts`, env, CI, тесты                                                                         | M      | checkout в test-mode доходит до Stripe-страницы, CSP-тест обновлён |
| 3.6 | `cart-page-client.tsx`: валюта из `STOREFRONT_CURRENCY`; `ProductCard`: селектор `itemsByProductId` или `useCart(s => s.items.find(...))` без `useShallow`-объекта (закрывает BACKLOG)                                                                                                                                                                                                                                                                   | `components/cart/cart-page-client.tsx`, `components/product-card.tsx`, `app/store/cart.ts`                                           | S      | тесты product-card и cart-page зелёные                             |
| 3.7 | Гигиена: `git rm --cached .DS_Store`, удалить `components.json`, решить судьбу `AGENTS.md` (закоммитить или в `.gitignore`), обновить бейджи и упоминания версий в README                                                                                                                                                                                                                                                                                | корень репозитория                                                                                                                   | S      | `git status` чист после `next dev`                                 |
| 3.8 | Документация: по мере закрытия пунктов отмечать статус в этом файле; старые `SECURITY_REVIEW_2026-07-11.md` и `PROJECT_IMPROVEMENT_PLAN.md` удалены 2026-10-25, их итог зафиксирован в разделе 3                                                                                                                                                                                                                                                         | этот файл                                                                                                                            | S      | —                                                                  |

### Этап 4. Отдельная задача: Stripe SDK (по желанию, после этапов 0–3)

| #   | Задача                                                                                                                                                                                                                                                                                       | Оценка | Примечание                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| 4.1 | Обновить `stripe` до версии, чья `LatestApiVersion` совпадает с закреплённой `2026-01-28.clover`, снять каст; пройти changelog 19→23 по используемым вызовам: `products.list`, `prices.retrieve`, `promotionCodes.list`, `checkout.sessions.create/retrieve/list`, `webhooks.constructEvent` | L      | Мажор. Делать отдельным PR с прогоном `test:integration:stripe` на тестовом ключе и ручным checkout |

## 6. Гейт перед мержем каждого PR

```bash
npm ci
npm run lint
npx tsc --noEmit
npx prettier --check .
npm run test:unit -- --run
npm run test:unit:coverage
CATALOGUE_SOURCE=fixture npm run build
npm run test:e2e:smoke
npm audit --omit=dev --audit-level=high
npm audit
```

## 7. Порядок и ожидаемый объём

1. Этап 0 (один PR, ~3 часа): сборка снова зелёная, high advisory закрыт.
2. Этап 1 (один PR, ~полдня): CI ловит типы, формат, сборку; Node 24;
   Dependabot группирует.
3. Этап 2 (один PR, ~полдня): minor-обновления и чистка зависимостей.
4. Этап 3 (три-четыре небольших PR, ~день): устаревшие конвенции Next,
   единый источник URL, `session.url`, гигиена.
5. Этап 4 отдельно, когда будет время на ручную проверку оплаты.
