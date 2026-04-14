# CLAUDE.md — Picflow Source of Truth

> **Picflow** — Drop it. Share it.
> A clean, fast image hosting and sharing platform where users can upload
> images anonymously or with an account, get an instant shareable link,
> and manage their uploads.

This file is the canonical specification for the Picflow build. Every
architectural decision, naming convention, design token, and constraint
lives here. Read this before writing or modifying any code in this repo.
If a deviation from this document is necessary, **document it here first**.

---

## 1. Repository Layout

Monorepo managed by **Turborepo** with **pnpm workspaces**.

```
/
├── turbo.json
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .env.example
├── CLAUDE.md
├── apps/
│   ├── web/    → Next.js 14 (App Router, TypeScript strict)
│   └── api/    → NestJS 10 (TypeScript strict)
└── packages/
    ├── shared/   → Shared DTOs, Zod schemas, TypeScript types
    └── tsconfig/ → Shared TypeScript configs (base, nextjs, nestjs)
```

Workspace packages are referenced as `@picflow/<name>` (e.g.
`@picflow/shared`, `@picflow/tsconfig`).

---

## 2. Tech Stack (Locked Versions / Libraries)

### Frontend — `apps/web`
- Next.js 14 (App Router only, no `pages/`)
- TypeScript strict mode
- Tailwind CSS v3
- shadcn/ui — approved components (customize via `components/ui/`, never modify the
  registry source directly):
  - **Existing (Phases 1–5):** Button, Card, Dialog, Toast, Progress, Tooltip,
    DropdownMenu, Skeleton, Badge, Avatar, Separator, Input, Label
  - **AI portrait phases:** Tabs, Sheet, Accordion, AspectRatio, ScrollArea, Alert,
    AlertDialog, Switch, RadioGroup, HoverCard, Form, Textarea, Select
  - **Tabs** — theme category browsing, dashboard tabs, multi-theme results, gallery filter
  - **Sheet** — Gelato print order bottom drawer; any panel that slides in from an edge
  - **Accordion** — FAQ on `/pricing`; any collapsible Q&A block
  - **AspectRatio** — portrait result cards, theme preview images, hero before/after images
  - **ScrollArea** — horizontal theme strip on landing; portrait result scroll on mobile
  - **Alert** — inline quality warnings, moderation rejection, failed generation messages
  - **AlertDialog** — destructive confirms only (delete portrait, delete account)
  - **Switch** — gallery opt-in toggle; any boolean setting toggle
  - **RadioGroup** — credit pack selection on `/pricing`; single theme selection
  - **HoverCard** — theme card hover mini-gallery (Phase 2 four-variant preview)
  - **Form** — auth forms, gift form, email gate; provides field-level validation via
    react-hook-form (adds `react-hook-form` + `@hookform/resolvers` as deps)
  - **Textarea** — gift personal message; any multi-line text input
  - **Select** — dashboard sort order (Newest / Oldest / Most Viewed / Largest)
  - Do NOT add components outside this list without updating this section first
- TanStack Query v5 — all server state (no `useState` for async data)
- react-dropzone — upload area
- axios — uploads with progress tracking (not `fetch`)
- next-auth v5 — authentication
- nanoid — client-side slug preview
- react-hot-toast — notifications (alongside shadcn Toast)
- lucide-react — the only icon library
- clsx + tailwind-merge — via the `cn()` helper
- date-fns — date formatting
- zustand — upload queue state ONLY (not a global state dumping ground)
- framer-motion — micro-animations only

### Backend — `apps/api`
- NestJS 10, TypeScript strict mode
- Prisma 5 (only ORM — no raw SQL)
- PostgreSQL 16
- Redis 7 (`ioredis`)
- BullMQ — image processing queue
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (Cloudflare R2)
- sharp — image processing (WebP conversion + thumbnails)
- passport + passport-jwt + passport-local — auth strategies
- bcrypt — password hashing
- class-validator + class-transformer — DTO validation
- `@nestjs/throttler` — rate limiting
- helmet — security headers
- nanoid — slug generation (8 character alphanumeric)
- multer — validation only (storage handled via R2 directly)
- `@nestjs/config` — env config with validation
- `@nestjs/bull` — BullMQ integration

### Shared — `packages/shared`
- zod — schema definitions shared between front and back
- TypeScript interfaces for `Image`, `User`, `UploadResponse`, etc.

### Infrastructure
- Cloudflare R2 (S3-compatible) for object storage
- `docker-compose.yml` for local dev: postgres, redis, api, worker, web

---

## 3. Design System

Premium developer-tool aesthetic — Vercel / Linear / Resend.
Dark-first. Precise. No gradients unless intentional.
Every spacing and color decision is deliberate.

### 3.1 Color Tokens

Defined as both **CSS variables** in `globals.css` and as **Tailwind theme
extensions** in `tailwind.config.ts` so they map to utility classes such
as `bg-bg-base`, `text-text-primary`, `border-border-default`,
`bg-accent`, etc.

**Backgrounds (dark default):**
| Token              | Value      | Use                                  |
| ------------------ | ---------- | ------------------------------------ |
| `--bg-base`        | `#0A0A0B`  | Page background (near black)         |
| `--bg-surface`     | `#111113`  | Cards, panels                        |
| `--bg-elevated`    | `#1A1A1E`  | Modals, dropdowns, hover states      |
| `--bg-subtle`      | `#222226`  | Input backgrounds, code blocks       |

**Borders:**
| Token              | Value                          |
| ------------------ | ------------------------------ |
| `--border-default` | `rgba(255,255,255,0.07)`       |
| `--border-strong`  | `rgba(255,255,255,0.12)`       |
| `--border-focus`   | `rgba(139,92,246,0.6)` violet  |

**Text:**
| Token               | Value      |
| ------------------- | ---------- |
| `--text-primary`    | `#F2F2F3`  |
| `--text-secondary`  | `#9898A4`  |
| `--text-tertiary`   | `#5C5C6B`  |
| `--text-disabled`   | `#3A3A47`  |

**Accent — Violet (NOT blue, NOT green):**
| Token               | Value                       |
| ------------------- | --------------------------- |
| `--accent-default`  | `#8B5CF6` (violet-500)      |
| `--accent-hover`    | `#7C3AED` (violet-600)      |
| `--accent-subtle`   | `rgba(139,92,246,0.12)`     |
| `--accent-border`   | `rgba(139,92,246,0.3)`      |

**Semantic:**
| Token       | Value      |
| ----------- | ---------- |
| `--success` | `#22C55E`  |
| `--warning` | `#F59E0B`  |
| `--error`   | `#EF4444`  |
| `--info`    | `#3B82F6`  |

### 3.2 Typography

- **Display / Headings:** `Geist` (vercel/geist-font)
- **Body / UI:** `Inter` (`next/font/google`)
- **Monospace** (links, slugs, code): `Geist Mono`

Type scale:
- Page title: `32px`, `font-semibold`, `tracking-tight`, `text-primary`
- Section heading: `20px`, `font-medium`, `text-primary`
- Body: `14px`, `font-normal`, `text-secondary`, `leading-relaxed`
- Caption: `12px`, `text-tertiary`
- Monospace slug: `13px`, `Geist Mono`, `bg-subtle`, `px-2 py-1`, `rounded`

### 3.3 Spacing & Layout

- Max page content width: `1100px`, centered
- Base grid unit: `4px` (use Tailwind's 4-point scale strictly)
- Section vertical padding: `py-16` desktop, `py-10` mobile
- Card padding: `p-5` default, `p-4` mobile
- Border radius: `8px` for cards, `6px` for inputs/buttons, `4px` for badges

### 3.4 Component Style Rules

**Buttons:**
- Primary: `bg-accent text-white hover:bg-accent-hover h-9 px-4 text-sm
  font-medium rounded-md transition-colors duration-150`
- Secondary: `bg-transparent border border-border-default
  text-text-secondary hover:border-border-strong hover:text-text-primary`
- Ghost: no border, `hover:bg-bg-elevated`
- Destructive: `bg-error/10 text-error border border-error/20`

**Cards:** `bg-surface border border-border-default rounded-xl`,
hover `border-border-strong`, `transition-colors duration-150`.
**No box-shadows — borders only.**

**Inputs:** `bg-subtle border border-border-default rounded-md h-9
text-sm`, focus `ring-2 ring-border-focus border-transparent
outline-none`, placeholder `text-tertiary`.

**Upload zone:** Large centered area, `border-2 border-dashed
border-border-default`. On drag-over: `border-accent-border
bg-accent-subtle`. Transition `all 150ms ease`. `rounded-xl
min-h-[280px]`. Show lucide `Upload` icon, heading, subtext inside.
On drag, animate icon with framer-motion scale pulse.

**Badges:** Small, `font-mono text-[11px] uppercase tracking-wide`.
Status variants: success/warning/error/info via semantic colors.

---

## 4. Database Schema (Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  username     String   @unique
  passwordHash String
  avatarUrl    String?
  storageUsed  Int      @default(0)   // bytes
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  images       Image[]
}

model Image {
  id           String    @id @default(cuid())
  slug         String    @unique        // nanoid(8) — share URL identifier
  filename     String
  mimeType     String
  size         Int                       // bytes
  width        Int?
  height       Int?
  originalKey  String                    // R2 object key
  thumbKey     String?                   // R2 key for 400px thumbnail
  webpKey      String?                   // R2 key for WebP variant
  blurHash     String?                   // blurhash placeholder
  views        Int       @default(0)
  isPublic     Boolean   @default(true)
  userId       String?
  user         User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  expiresAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([slug])
  @@index([userId])
  @@index([createdAt])
}
```

---

## 5. Backend Architecture (`apps/api`)

### 5.1 Module Tree

```
src/
├── main.ts                      # bootstrap, helmet, pipes, cors
├── app.module.ts
├── config/
│   ├── config.module.ts         # validate env on startup
│   └── config.schema.ts         # zod schema for env
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── redis/
│   ├── redis.module.ts
│   └── redis.service.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/{jwt,local}.strategy.ts
│   ├── guards/{jwt-auth,optional-jwt}.guard.ts
│   └── dto/{login,register}.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── dto/update-user.dto.ts
├── upload/
│   ├── upload.module.ts
│   ├── upload.controller.ts     # POST /upload/presign, /upload/confirm
│   ├── upload.service.ts
│   └── dto/{presign-request,confirm-upload}.dto.ts
├── images/
│   ├── images.module.ts
│   ├── images.controller.ts     # GET /i/:slug, DELETE /images/:id, GET /images
│   ├── images.service.ts
│   └── dto/image-response.dto.ts
├── workers/
│   ├── workers.module.ts
│   └── image-processor.processor.ts  # BullMQ + Sharp
├── storage/
│   ├── storage.module.ts
│   └── storage.service.ts       # R2 abstraction
└── common/
    ├── decorators/current-user.decorator.ts
    ├── filters/http-exception.filter.ts
    ├── interceptors/transform.interceptor.ts  # { data, meta }
    └── pipes/zod-validation.pipe.ts
```

### 5.2 Upload Flow

1. **Client → `POST /upload/presign`** `{ filename, mimeType, size }`
   - Validate file type (`jpg`, `png`, `gif`, `webp` only, max 20MB)
   - Rate limit: 20 uploads/hour anonymous, 200/hour authenticated
   - Generate `nanoid(8)` slug + R2 key
   - Generate presigned PUT URL (15 min expiry)
   - Returns `{ uploadUrl, slug, key }`

2. Client uploads directly to R2 via the presigned URL using XHR
   (axios) so we get progress events.

3. **Client → `POST /upload/confirm`** `{ key, slug }`
   - HeadObject to verify R2 upload exists
   - Persist `Image` row in Postgres
   - Push job to BullMQ: `{ imageId, key }`
   - Returns `{ slug, shareUrl }`

4. **Worker** (BullMQ consumer):
   - Download from R2
   - Sharp: extract width/height/metadata
   - Sharp: generate `400px` thumbnail (WebP)
   - Sharp: generate full WebP variant
   - Compute blurhash
   - Upload `thumb` + `webp` back to R2
   - Update `Image` with `thumbKey`, `webpKey`, `blurHash`, `width`, `height`

### 5.3 Caching Strategy

- Image metadata by slug — key `img:{slug}`, TTL 1 hour, invalidate on delete
- User image list — key `user-imgs:{userId}:page:{n}`, TTL 5 min
- View counter via Redis `INCR`, flushed to Postgres every 5 min

### 5.4 Error Handling

- Global `HttpException` filter
- All responses wrapped via transform interceptor: `{ data: T, meta?: M }`
- Never expose stack traces in production
- Errors logged with context using NestJS `Logger`

---

## 6. Frontend Architecture (`apps/web`)

### 6.1 App Router Layout

```
app/
├── layout.tsx              # Geist font, QueryProvider, ThemeProvider
├── page.tsx                # home — upload zone + hero
├── i/[slug]/
│   ├── page.tsx            # image view
│   └── opengraph-image.tsx # OG generation
├── dashboard/page.tsx      # user gallery (protected)
├── auth/{login,register}/page.tsx
└── api/auth/[...nextauth]/route.ts
```

### 6.2 Components

```
components/
├── upload/
│   ├── UploadZone.tsx
│   ├── UploadQueue.tsx
│   ├── UploadItem.tsx
│   └── UploadSuccessCard.tsx
├── images/
│   ├── ImageCard.tsx
│   ├── ImageGrid.tsx
│   ├── ImageViewer.tsx
│   ├── CopyLinkButton.tsx
│   └── ImageStats.tsx
├── layout/
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── PageContainer.tsx
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── ui/                     # shadcn — do not modify directly
└── common/
    ├── BlurImage.tsx
    ├── EmptyState.tsx
    ├── LoadingSpinner.tsx
    └── ConfirmDialog.tsx
```

### 6.3 lib / hooks / store / utils

```
lib/
├── api/{client,upload,images,auth}.ts
├── hooks/{useUpload,useClipboardPaste,useCopyToClipboard,useImageQuery}.ts
├── utils/{format,cn}.ts
├── store/upload.store.ts
└── config.ts
types/index.ts             # re-exports from @picflow/shared
```

---

## 7. Key UX Behaviors (must match exactly)

**Upload zone**
- Drag & drop, `Cmd/Ctrl+V` paste anywhere on the page, click-to-browse
- Multi-file: each becomes its own upload
- File type / size validation errors shown inline (not toast)
- Drag-enter: violet border, slight bg tint, icon scales up
- During upload: progress bar with bytes (not just %)
- Done: `UploadSuccessCard` with shareable link
- Copy button shows "Copied!" for 2 seconds then resets

**Image view page (`/i/[slug]`)**
- Full-size image centered, dark background
- Sidebar (desktop) / below (mobile): filename, size, dimensions,
  upload date, view count, copy + download buttons
- OG meta tags so links unfurl on WhatsApp/Twitter/iMessage
- Blurhash placeholder while image loads
- Owner sees delete button

**Dashboard**
- Masonry grid (4 col desktop, 2 col mobile)
- Hover overlay on each card: copy / delete / view
- IntersectionObserver for infinite scroll
- Sort: Newest, Oldest, Most Viewed, Largest
- Header shows total storage used
- Empty state shows upload prompt

**Header**
- Logo: "Picflow" in Geist `font-semibold` + small violet square icon
- Logged-out: "Log in" ghost + "Sign up" primary
- Logged-in: avatar, username, dropdown (Dashboard / Logout)
- Minimal — utility app

**Animations (framer-motion, subtle)**
- UploadZone icon `1 → 1.1` on drag-over
- UploadSuccessCard slide-up + fade-in on mount
- ImageCard `1 → 1.02` scale on hover
- Toasts slide in from bottom-right
- Page transitions: fade only (200ms opacity)
- Never animate layout shifts

---

## 8. Code Quality Rules (Non-Negotiable)

- TypeScript strict mode everywhere — **no `any`, no `as` casts without
  a comment explaining why**
- Every async function has an explicit return type annotation
- No component file exceeds **200 lines** — split into sub-components
- No business logic in components — hooks and services only
- All API calls go through `lib/api/` — no `fetch`/`axios` in components
- All env vars typed and validated at startup (both apps)
- Every Prisma query uses `select` to avoid over-fetching
- No raw SQL — Prisma only
- All errors caught and handled — no unhandled promise rejections
- No `console.log` in production code — use NestJS `Logger` or remove
- Every NestJS route has a DTO with `class-validator` decorators
- Every public API endpoint has rate limiting applied
- No secrets in code — `.env` only, `.env` never committed
- Naming: `PascalCase` components, `camelCase` functions,
  `SCREAMING_SNAKE_CASE` constants, `kebab-case` filenames

---

## 9. Environment Variables

Single `.env.example` at repo root. **Never commit `.env`.**

```
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/picflow

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
R2_ENDPOINT=

# App
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

---

## 10. Build Order

| Phase | Goal                  | Items |
| ----- | --------------------- | ------ |
| **1** | Foundation            | Turborepo + pnpm, CLAUDE.md, packages/shared, packages/tsconfig, docker-compose, .env.example |
| **2** | Backend Core          | NestJS scaffold, Prisma, Config, Prisma+Redis services, Auth, Storage (R2), Upload module, Images module, BullMQ worker, global pipes/filters/interceptors |
| **3** | Frontend Core         | Next.js scaffold, design tokens, Geist+Inter fonts, layout/Header/Footer/PageContainer, axios client, upload+images API, zustand store, useUpload hook |
| **4** | Features              | UploadZone, UploadQueue/Item, UploadSuccessCard, home page, /i/[slug] + OG, auth pages, dashboard + grid, header auth state |
| **5** | Polish                | framer-motion animations, skeleton loaders, empty states, mobile responsive, BlurImage with blurhash, error boundaries, button loading states |

After every phase: short summary of what's built and what's next.
**Do not skip ahead.** **No silent placeholder TODOs** — every TODO
must be recorded in the "Outstanding TODOs" section below.

---

## 11. What NOT To Do

- ❌ Blue as primary accent — **violet only**
- ❌ White backgrounds — dark mode is the default
- ❌ Box shadows on cards — borders only
- ❌ Gradients on backgrounds or buttons
- ❌ Hero illustrations / stock photos on the landing page
- ❌ Components outside the approved list in §2
- ❌ API calls directly in React components
- ❌ `pages/` router — App Router only
- ❌ `any` to bypass TypeScript
- ❌ Files over 200 lines without splitting
- ❌ Adding unlisted features without recording them here

---

## 12. Outstanding TODOs / Deviations

> Anything we deferred or changed from the spec gets logged here, dated,
> with a one-line reason.

- **Phase 1 — `docker-compose.yml`:** `postgres` and `redis` defined in
  Phase 1, `api` and `worker` added in Phase 2, `web` added in Phase 3.
  All four Dockerfiles + compose entries now present.
- **Phase 3 — Auth token storage:** JWTs are stored in `localStorage`
  under key `picflow:token` and sent via `Authorization: Bearer <t>`.
  This is a pragmatic choice for the utility-app scope; moving to
  httpOnly cookies (with next-auth handling session rotation) is a
  Phase 5 follow-up if we add any sensitive data beyond share links.
- **Phase 3 — `next-auth`:** listed in CLAUDE.md §2 but not yet wired
  up — the current auth flow uses direct calls to the NestJS `/auth/*`
  endpoints. `next-auth` will be added in Phase 4 to support the
  `app/api/auth/[...nextauth]/route.ts` route specified in §6.1 once
  we decide whether we need OAuth providers or just keep credentials.
- **Phase 2 — worker deployment model:** `api` and `worker` share the
  same Docker image and entrypoint (`node dist/main.js`). Both containers
  run the full NestJS app, meaning both also run the `@Processor` and
  will share jobs from the BullMQ queue. Splitting into a dedicated
  worker bootstrap file is deferred until horizontal scaling actually
  requires it.
- **Phase 2 → resolved in Phase 5 — Views flush loop:** every view bump
  now also `SADD`s the slug into `img:views:tracked`. A BullMQ
  repeatable job (`workers/view-flush.processor.ts`, queue
  `view-flush`) ticks every `VIEW_FLUSH_INTERVAL_MS` (5 min), `SPOP`s
  the set, and reconciles each slug via
  `ImagesService.flushAllTrackedViews()`. Re-arms idempotently on
  bootstrap so multi-replica deploys don't double-schedule.
- **Phase 2 — `update-user.dto.ts`:** CLAUDE.md §5.1 lists this DTO, but
  the only user endpoint so far is `GET /users/me`. The DTO will be
  added in Phase 4 when `PATCH /users/me` is needed for profile edits.
- **Phase 4 → resolved — Input / Label + Form suite:** `Input` and `Label`
  were added as minimal primitives in Phase 4. Both are now formally in the
  approved shadcn list (§2) alongside `Form` (react-hook-form integration).
  `Form` supersedes the manual Input+Label approach for new forms going forward.
- **Phase 4 — `next-auth` deferred to Phase 5:** login/register still
  hit the NestJS `/auth/*` endpoints directly. The
  `app/api/auth/[...nextauth]/route.ts` route from §6.1 does not exist
  yet. Dashboard gating is therefore client-side only (a brief
  logged-out flash is possible before the `useEffect` redirect fires).
- **Phase 4 → resolved in Phase 5 — BlurImage blurhash decoding:**
  `lib/utils/blurhash.ts` now decodes the hash on the client (32×32 →
  canvas → PNG data URL, cached per hash). `BlurImage` shows the
  decoded blur as an absolute-positioned background until the real
  image's `onLoad` fires.
- **Phase 5 — Error & loading boundaries:** added `app/error.tsx`,
  `app/global-error.tsx`, and per-route `error.tsx` for `/dashboard`
  and `/i/[slug]`; route-level `loading.tsx` skeletons for
  `/dashboard` and `/i/[slug]`. Shared `ErrorView` component keeps
  copy + styling consistent.
- **Phase 5 — Recent uploads on home:** §6.1 calls for "recent uploads
  if authed" on the home page. Added
  `components/dashboard/RecentUploadsSection` — renders the four
  newest images for authenticated users and stays silent for
  anonymous visitors.
- **Phase 5 — `next-auth` still deferred:** kept localStorage JWT for
  the v1 utility scope. Tracked here for future revisit.
- **Phase 4 — Portrait results page:** `app/portraits/[shareSlug]/page.tsx` + `PortraitPageView.tsx`
  now exist. Polling via `usePortraitStatus`, `GeneratingScreen` for in-progress states,
  `PortraitResultsGrid` (2×2) + `PortraitResultCard` for download/print on done state.
- **Phase 4 — Gift flow:** `Gift` Prisma model, `gifts` NestJS module (`POST /gifts`, `GET /gifts/:id`),
  `/gifts/new` (create form), `/gifts/[giftId]` (recipient page). Gift link marks as claimed on first view.
- **Phase 4 — Gallery:** `Portrait.isPublic` field, `gallery` NestJS module (`GET /gallery`, `PATCH /gallery/:shareSlug`),
  `/gallery` page with infinite scroll + category tabs. Toggle on portrait results page.
- **Phase 4 — Analytics:** Redis-backed counters (starts/completions/failures per theme) flushed to
  `ThemeAnalytics` Prisma model. `AnalyticsService` injected into `PortraitsService`. Admin dashboard
  at `/dashboard/admin` (checks `ADMIN_USER_ID` env var; any user if unset in dev).
- **Phase 4 — Gelato print (stub):** `POST /portraits/:shareSlug/print` returns 503 until `GELATO_API_KEY`
  configured. `PrintOrderSheet` (bottom Sheet) shows "Coming soon" with product list grayed out.
- **Phase 4 — Header nav:** `HeaderNavLinks.tsx` adds Themes + Gallery links (desktop). User dropdown
  gets Analytics link → `/dashboard/admin`.
