# Picflow → TinySnap Clone — Master Plan

> **Product:** AI baby portrait generator — "Turn simple baby photos into stunning portraits."
> **Stack:** Next.js 14 · NestJS 10 · PostgreSQL · Redis · BullMQ · AWS S3 (→ R2) · Replicate API · Stripe · Gelato

---

## Product Positioning

**"Professional baby portraits from your phone photos — in seconds."**

Dark premium aesthetic (keep exactly as-is) = luxury photo studio feel.
The dark background with violet accents positions this as *premium*, not cheap.
Competitors use light/pastel UIs — we stand out.

---

## Phase 1 — AI Portrait Engine

### What we build
User uploads 1–5 baby photos → picks a theme → AI generates 4 portrait variants → results page with download + share.

### Tech choice: Replicate API
- **Why Replicate:** No GPU management, pay-per-run (~$0.05–0.15/generation), 200+ models, simple REST API, webhooks for async jobs
- **Model:** `tencentarc/photomaker` — identity-preserving portrait generation. Takes real photos and transforms them into artistic styles while keeping the face recognizable. Perfect for babies.
- **Fallback model:** `fofr/face-to-many` (faster, more styles, slightly less identity-accurate)
- **Outputs:** 4 portrait variants per generation

### New env vars
```
REPLICATE_API_TOKEN=
REPLICATE_WEBHOOK_SECRET=   # random secret appended to webhook URL for verification
RESEND_API_KEY=             # email notifications
AWS_REKOGNITION_REGION=     # content moderation (can reuse AWS creds above)
```

---

### Database — New Prisma models

```prisma
model User {
  // ... existing fields ...
  creditBalance Int                @default(3)   // 3 free credits on signup
  portraits     Portrait[]
  credits       CreditTransaction[]
}

model Portrait {
  id          String         @id @default(cuid())
  userId      String?
  user        User?          @relation(fields: [userId], references: [id], onDelete: SetNull)
  email       String?        // captured for anonymous email-gate — used for "ready" email
  status      PortraitStatus @default(PENDING)
  themeSlug   String
  inputKeys   String[]       // S3 keys for uploaded source photos (deleted after generation)
  replicateId String?        // Replicate prediction ID for polling + webhook lookup
  results     PortraitResult[]
  shareSlug   String         @unique  // nanoid(8) — share URL identifier
  expiresAt   DateTime?      // anonymous portraits expire after 7 days
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([userId])
  @@index([shareSlug])
  @@index([createdAt])
  @@map("portraits")
}

model PortraitResult {
  id         String   @id @default(cuid())
  portraitId String
  portrait   Portrait @relation(fields: [portraitId], references: [id], onDelete: Cascade)
  s3Key      String
  width      Int?
  height     Int?
  blurHash   String?
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())

  @@index([portraitId])
  @@map("portrait_results")
}

model CreditTransaction {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  delta       Int        // +3 purchase, -1 generation
  type        CreditType
  description String
  stripeId    String?    // Stripe payment intent ID
  portraitId  String?
  createdAt   DateTime   @default(now())

  @@index([userId])
  @@map("credit_transactions")
}

enum PortraitStatus {
  PENDING
  PROCESSING
  DONE
  FAILED
}

enum CreditType {
  SIGNUP_BONUS
  PURCHASE
  GENERATION
  REFUND
}
```

---

### Backend — New NestJS modules

```
src/
├── replicate/
│   ├── replicate.module.ts
│   └── replicate.service.ts              ← createPrediction, getPrediction
├── themes/
│   ├── themes.module.ts
│   ├── themes.service.ts                 ← theme registry (30 themes as constants)
│   └── themes.controller.ts              ← GET /themes, GET /themes/:slug
├── portraits/
│   ├── portraits.module.ts
│   ├── portraits.controller.ts           ← POST /portraits/start
│   │                                        GET /portraits/:shareSlug
│   │                                        GET /portraits/:shareSlug/status
│   ├── portraits.service.ts
│   └── dto/
│       ├── start-portrait.dto.ts         ← { themeSlug, inputKeys[] }
│       └── portrait-response.dto.ts
├── credits/
│   ├── credits.module.ts
│   └── credits.service.ts                ← getBalance, debit, credit, history
└── workers/
    ├── image-processor.processor.ts      ← existing, unchanged
    ├── portrait-generator.processor.ts   ← NEW: calls Replicate, stores results
    └── workers.module.ts                 ← register both processors
```

### Portrait generation flow

```
POST /portraits/start
  → validate user has ≥ 1 credit
  → debit 1 credit (optimistic, inside Prisma $transaction)
  → create Portrait row (PENDING)
  → enqueue BullMQ job: { portraitId, themeSlug, inputKeys }
  → return { shareSlug, status: 'PENDING' }

BullMQ worker (portrait-generator.processor.ts):
  → download source images from S3
  → content moderation check via AWS Rekognition DetectModerationLabels
      → if flagged: status = FAILED, refund credit, do not call Replicate
  → call Replicate API with tencentarc/photomaker
      → include webhook_url: {API_URL}/portraits/webhook/replicate?secret={REPLICATE_WEBHOOK_SECRET}
  → poll Replicate every 5s as a live fallback (max 10 min)
  → on completion (webhook OR polling, whichever fires first):
      → download generated images from Replicate CDN
      → upload to S3 at portraits/{portraitId}/result-{n}.jpg
      → compute blurhash for each result
      → create PortraitResult rows in DB
      → update Portrait.status = DONE
      → send "portraits ready" email via Resend (if email on Portrait)
      → delete source input S3 keys (privacy)
  → on any failure: status = FAILED, refund 1 credit

POST /portraits/webhook/replicate  ← Replicate calls this when prediction finishes
  → verify HMAC from X-Replicate-Signature header against REPLICATE_WEBHOOK_SECRET
  → look up Portrait by replicateId stored in metadata
  → if SUCCEEDED: run same completion handler as polling path (idempotent)
  → if FAILED: mark FAILED, refund credit
  → NOTE: webhook is the source of truth — polling is UI-only for live waiting

GET /portraits/:shareSlug/status
  → returns { status, results: PortraitResult[] }
  → frontend polls this every 3s until status = DONE or FAILED
  → if user closed the tab and returns later, results are already there
```

### Content moderation

Every upload runs through AWS Rekognition `DetectModerationLabels` before being sent to Replicate.

```
Moderation categories to reject:
  - Explicit Nudity (any confidence ≥ 60)
  - Violence (confidence ≥ 80)
  - Visually Disturbing (confidence ≥ 80)

On rejection:
  → Portrait.status = FAILED
  → Credit refunded immediately
  → Error response: "This image can't be processed — please try a different photo"
  → No logging of the rejected image URL (privacy)
```

This runs in the worker, not the upload step, to keep the upload fast. Sprint 1 deliverable.

### Email notifications (Resend)

Generation takes 2–3 minutes — users will close the tab. Email recovery is critical.

```
src/email/
├── email.module.ts
└── email.service.ts         ← sendPortraitsReady(email, shareSlug, firstName?)

Triggered: when Portrait.status flips to DONE
Template: React Email — "Your portraits are ready"
  Subject: "✨ Your baby portraits are ready"
  Body: preview thumbnail of result-0, link to /portraits/{shareSlug}, download CTA

Email is captured at:
  → Signup (stored on User)
  → Email-only gate (stored on Portrait.email for anonymous visitors)
```

New env var: `RESEND_API_KEY=`

---

### Frontend — New pages and components

```
app/
├── page.tsx                            ← REDESIGN: new landing page
├── create/
│   ├── layout.tsx                      ← step progress bar (1 Upload → 2 Theme → 3 Generate)
│   ├── page.tsx                        ← Step 1: upload photos
│   └── themes/page.tsx                 ← Step 2: pick theme
├── portraits/[shareSlug]/
│   ├── page.tsx                        ← results page
│   ├── loading.tsx
│   └── opengraph-image.tsx
└── dashboard/page.tsx                  ← updated: portraits + raw uploads tabs

components/
├── portrait/
│   ├── PortraitUploadStep.tsx          ← multi-photo upload (1–5 files)
│   ├── ThemeGrid.tsx                   ← visual theme picker grid
│   ├── ThemeCard.tsx                   ← theme card: preview image + name + hover
│   ├── GeneratingScreen.tsx            ← animated wait screen (~2 min avg)
│   ├── PortraitResultsGrid.tsx         ← 2×2 grid of generated variants
│   ├── PortraitResultCard.tsx          ← single result: download + share + print
│   └── CreditBadge.tsx                 ← "◆ 3 credits" shown in header
├── landing/
│   ├── HeroSection.tsx                 ← before/after slider + main CTA
│   ├── HowItWorksSection.tsx           ← 3-step visual walkthrough
│   ├── SampleGallerySection.tsx        ← masonry of example outputs
│   ├── ThemePreviewSection.tsx         ← horizontal scrollable theme strip
│   └── SocialProofSection.tsx          ← "10,000+ portraits created"
```

### UX flow — step by step

```
/ (Landing page)
  ↓ "Create portraits" CTA
/create
  → Upload zone (1–5 photos, same UploadZone component, modified)
  → Each photo shows preview thumbnail + remove button
  → "Choose theme →" button (active once ≥ 1 photo uploaded)
  ↓
/create/themes
  → Grid of 30 themes (6 cols desktop, 2 cols mobile)
  → Each card: sample output image + name + category badge
  → Click to select → violet border highlight
  → "Generate portraits →" button with credit cost shown
  ↓ redirect immediately to /portraits/[shareSlug]
/portraits/[shareSlug]  (status = PENDING / PROCESSING)
  → GeneratingScreen: animated violet pulse, cycling copy every 25s:
      0–25s:   "Analyzing your photos..."
      25–50s:  "Painting the portrait..."
      50–90s:  "Adding fine details..."
      90–120s: "Almost ready..."
      120s+:   "Just a few more seconds..." (loops)
  → Copy transitions with a 200ms fade — never a jarring jump
  → Client polls /status every 3s
  ↓ (status = DONE)
  → PortraitResultsGrid fades in (2×2 grid, 4 variants)
  → Each card: Download · Share · Print (Phase 3)
  → "Generate another theme →" CTA (uses 1 more credit)
```

---

### Themes — 30 constants (no DB needed)

```ts
// packages/shared/src/constants/themes.ts
export const THEMES = [
  // Classic Studio — all free
  { slug: 'studio-white',    name: 'Studio White',    category: 'classic',  free: true  },
  { slug: 'dramatic-light',  name: 'Dramatic Light',  category: 'classic',  free: true  },
  { slug: 'vintage-film',    name: 'Vintage Film',    category: 'classic',  free: true  },
  // Nature & Floral
  { slug: 'spring-blossom',  name: 'Spring Blossom',  category: 'nature',   free: true  },
  { slug: 'wildflower',      name: 'Wildflower Field',category: 'nature',   free: false },
  { slug: 'forest-fairy',    name: 'Forest Fairy',    category: 'nature',   free: false },
  { slug: 'garden-morning',  name: 'Garden Morning',  category: 'nature',   free: false },
  // Fantasy & Whimsy
  { slug: 'cloud-kingdom',   name: 'Cloud Kingdom',   category: 'fantasy',  free: true  },
  { slug: 'stardust',        name: 'Stardust Dreams', category: 'fantasy',  free: false },
  { slug: 'rainbow-magic',   name: 'Rainbow Magic',   category: 'fantasy',  free: false },
  { slug: 'moonlit-wonder',  name: 'Moonlit Wonder',  category: 'fantasy',  free: false },
  // Seasonal
  { slug: 'winter-wonder',   name: 'Winter Wonderland',category: 'seasonal',free: false },
  { slug: 'autumn-harvest',  name: 'Autumn Harvest',  category: 'seasonal', free: false },
  { slug: 'summer-sunshine', name: 'Summer Sunshine', category: 'seasonal', free: true  },
  { slug: 'spring-morning',  name: 'Spring Morning',  category: 'seasonal', free: false },
  // Artistic
  { slug: 'watercolor',      name: 'Watercolor',      category: 'artistic', free: false },
  { slug: 'oil-portrait',    name: 'Oil Portrait',    category: 'artistic', free: false },
  { slug: 'impressionist',   name: 'Impressionist',   category: 'artistic', free: false },
  { slug: 'comic-hero',      name: 'Comic Book Hero', category: 'artistic', free: false },
  // Adventure
  { slug: 'astronaut',       name: 'Little Astronaut',category: 'adventure',free: true  },
  { slug: 'ocean-explorer',  name: 'Ocean Explorer',  category: 'adventure',free: false },
  { slug: 'jungle-adventure',name: 'Jungle Adventure',category: 'adventure',free: false },
  { slug: 'safari-baby',     name: 'Safari Baby',     category: 'adventure',free: false },
  // Cultural
  { slug: 'japanese-garden', name: 'Japanese Garden', category: 'cultural', free: false },
  { slug: 'nordic-winter',   name: 'Nordic Winter',   category: 'cultural', free: false },
  { slug: 'moroccan-dreams', name: 'Moroccan Dreams', category: 'cultural', free: false },
  // More premium
  { slug: 'angel-wings',     name: 'Angel Wings',     category: 'fantasy',  free: false },
  { slug: 'royal-portrait',  name: 'Royal Portrait',  category: 'classic',  free: false },
  { slug: 'boho-dreams',     name: 'Boho Dreams',     category: 'nature',   free: false },
  { slug: 'neon-future',     name: 'Neon Future',     category: 'artistic', free: false },
]

// Free themes: studio-white, dramatic-light, vintage-film, spring-blossom,
//              cloud-kingdom, summer-sunshine, astronaut (7 free)
// All others: unlocked with any credit purchase
```

---

## Phase 2 — Theme Gallery & Quality

### What we build
Better themes, category browsing, theme preview page with sample outputs, multi-theme batch, photo guidance.

### Theme discovery page `/themes`
- Category tab bar: All / Classic / Nature / Fantasy / Seasonal / Artistic / Adventure
- Each theme card shows 4 real sample portraits (generated during beta, consented)
- Hover state: expands to show all 4 variants in a mini-gallery
- Click → `/create?theme=slug` (pre-selects the theme, skips step 2)

### Theme quality improvements
- Fine-tune prompts per theme based on real output quality data
- Add negative prompts to each theme to prevent blurry/distorted faces
- Store per-theme quality score (hidden) → used to rank "Trending" section
- A/B test prompt variations using completion success rates logged in Redis

### Multi-theme batch (Phase 2 differentiator vs tinysnap)
- User selects up to 3 themes at once
- Costs 3 credits → generates 12 portraits (4 per theme)
- Results page shows portraits organised by theme with tab navigation
- UX copy: "Get all three looks in one generation"

### Photo guidance UI (critical for AI quality)
```
PortraitUploadStep improvements:
  → Tip cards shown next to the upload zone:
    ✓ Use a clear recent photo of just the baby
    ✓ Face clearly visible, looking roughly at camera
    ✓ Bright natural lighting
    ✗ Avoid sunglasses, hats, heavy shadows
    ✗ Avoid group photos — crop to baby only
  → No client-side face detection in Phase 2 — ~2MB TF model load not worth it yet
  → Instead: if Replicate returns a low-confidence or blurry result, show inline
    warning on results page: "Results may be lower quality — try a clearer photo"
  → Defer real face detection to Phase 3 once we have output quality data to justify it
```

### Result quality sorting
- After generation each portrait is scored: face sharpness + Replicate confidence
- Best portraits sorted to top-left automatically
- User can re-order by dragging (framer-motion drag)

---

## Phase 3 — Monetisation

### Credit system

```
Email-only visitor:   1 free credit  (email required before generation — no password)
                      → email captured on Portrait row, used for "portraits ready" email
                      → prevents throwaway-session abuse
                      → natural re-engagement touchpoint for conversion to paid
New account signup:   3 free credits (incentivise registration)

Credit packs:
  Starter  —  5 credits  — $4.99   ($1.00/gen)
  Popular  — 15 credits  — $11.99  ($0.80/gen)  ← "Most Popular" badge
  Pro      — 40 credits  — $24.99  ($0.62/gen)

Subscription:
  Monthly  — 12 credits/month — $9.99/month ($0.83/gen)
           + all premium themes unlocked
           + priority generation queue
```

### Payment: Stripe

```
src/payments/
├── payments.module.ts
├── payments.controller.ts   ← POST /payments/checkout
│                               POST /payments/webhook  (Stripe → signed)
└── payments.service.ts      ← createCheckoutSession, handleWebhook
```

**Checkout flow:**
```
User clicks "Buy credits" on /pricing
  → POST /payments/checkout { pack: 'popular' }
  → API creates Stripe Checkout Session (Stripe-hosted page)
  → Returns { url } → frontend redirects to stripe.com
  → User pays
  → Stripe fires webhook → POST /payments/webhook
  → API verifies signature → adds credits → CreditTransaction row
  → Redirect to /portraits with "Credits added!" toast
```

### New env vars
```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Pricing page `/pricing`
- 3 credit pack cards + 1 subscription card
- Comparison table: free vs paid (theme access, batch gen, expiry, priority queue)
- "Most Popular" badge on middle pack
- FAQ accordion (Why credits? Do they expire? Refund policy?)
- Testimonials strip above the pricing cards

### Credit UI throughout the app
```
Header (logged in):    [◆ 3 credits] violet badge → click opens /pricing
/create page:          "This will use 1 credit (3 remaining)"
Out of credits modal:  "You're out of credits" + upgrade CTA + pricing cards
                       (shown as a Dialog, not a page redirect)
```

---

## Pre-launch Requirements (not a phase — required before any real traffic)

### GDPR / Privacy

Parents uploading baby photos will read a privacy policy before trusting this product. This must exist at launch, not Phase 4.

**Pages required:**
- `/privacy` — Privacy policy
- `/terms` — Terms of service

**Privacy policy must clearly state:**
- What data we collect (email, uploaded photos, generated results)
- How long we store it (raw input photos deleted after generation; results kept 7 days for anonymous, indefinitely for accounts)
- Photos are **never used for model training** — state this explicitly
- How to request deletion: email or in-app "Delete all my data" button
- Third-party processors: AWS S3, Replicate, Stripe (link to their policies)
- GDPR: right to erasure, right to access, supervisory authority contact

**In-app copy:**
- Upload step: "Your photos are processed securely and never used for training. [Privacy policy]"
- Anonymous email gate: "We'll email you when portraits are ready. No spam. [Privacy policy]"

---

## Phase 4 — Growth & Virality

### Gift flow
```
/gifts/new
  → After generating a portrait pack, user clicks "Send as Gift"
  → Enters: recipient name + optional personal message
  → Gets a gift link: /gifts/[giftId]

/gifts/[giftId]
  → "You received a gift from {name}!" landing
  → Shows the portrait pack
  → "Download all" button — no account required
  → Soft CTA: "Create your own portraits for free →"
```

**New Prisma model:**
```prisma
model Gift {
  id            String   @id @default(cuid())
  portraitId    String
  portrait      Portrait @relation(...)
  recipientName String
  message       String?
  claimed       Boolean  @default(false)
  claimedAt     DateTime?
  createdAt     DateTime @default(now())

  @@map("gifts")
}
```

### Print integration: Gelato API
```
PortraitResultCard → "Order print" button
  → Opens shadcn Sheet from bottom:
    ┌─────────────────────────────┐
    │  Order a print              │
    │  5×7"  glossy    $12.99     │
    │  8×10" glossy    $18.99     │
    │  11×14" glossy   $29.99     │
    │  12×12" canvas   $49.99     │
    │  Phone case      $24.99     │
    └─────────────────────────────┘
  → Click product → Gelato API creates order
  → Redirect to Gelato checkout
  → Gelato handles printing + worldwide shipping
```

**New env var:** `GELATO_API_KEY=`

### Public gallery `/gallery`
- Masonry wall of user-consented portrait outputs
- "Add mine to the gallery" opt-in toggle on the results page
- Filter by theme category (tab bar)
- Each portrait links to `/create?theme=slug` → drives new user acquisition
- SEO: static metadata per gallery page:
  `"AI baby portrait [theme name] — created on Picflow"`

### Analytics (privacy-first, no third-party trackers)
```
Track server-side using Redis + daily Postgres flush:
  - Generation starts / completions / failures per theme
  - Credit conversion rate (free attempt → paid)
  - Most popular themes by day / week
  - Average funnel time: landing → upload → generate → result

Admin dashboard: /dashboard/admin (protected, owner only)
```

---

## Code Quality Rules (additions to existing CLAUDE.md)

- All AI generation calls wrapped in try/catch — always refund credit on failure
- Replicate polling hard timeout: 10 minutes → mark FAILED, refund credit
- All portrait S3 keys: `portraits/{portraitId}/result-{n}.jpg`
- Anonymous portrait S3 objects: S3 lifecycle rule → auto-delete after 7 days
- Never log baby photo URLs or source keys in production logs (privacy)
- Stripe webhook: verify signature on every request — reject 400 without it
- Credits debit + Portrait creation in a single Prisma `$transaction` — never debit without creating the job
- Replicate source photos deleted from S3 after generation completes (only results kept)

---

## Implementation Sprints

| Sprint | Delivers | Key files |
|--------|----------|-----------|
| **1** | Prisma migration + Replicate service + portrait-generator worker + content moderation + Replicate webhook endpoint + email service (Resend) + `/portraits/start` + `/portraits/:slug/status` | `schema.prisma`, `replicate.service.ts`, `portrait-generator.processor.ts`, `portraits.controller.ts`, `email.service.ts` |
| **2** | Theme constants in shared + ThemeGrid + ThemeCard UI + `/create` step 1 (upload + email gate for anon) + `/create/themes` step 2 | `themes.ts`, `ThemeGrid.tsx`, `ThemeCard.tsx`, `create/page.tsx`, `create/themes/page.tsx` |
| **3** | `/portraits/[shareSlug]` results page + PortraitResultsGrid + status polling + GeneratingScreen (rotating copy animation) | `portraits/[shareSlug]/page.tsx`, `PortraitResultsGrid.tsx`, `GeneratingScreen.tsx` |
| **4** | Landing page redesign: HeroSection (before/after slider) + HowItWorks + SampleGallery + ThemePreviewStrip + `/privacy` + `/terms` pages | `app/page.tsx`, `HeroSection.tsx`, `HowItWorksSection.tsx`, `privacy/page.tsx`, `terms/page.tsx` |
| **5** | CreditBadge in header + credits API endpoints + out-of-credits modal + signup bonus logic | `CreditBadge.tsx`, `credits.service.ts`, `auth.service.ts` (add signup bonus) |
| **6** | Gift flow + `/gifts/[giftId]` page — strongest virality mechanic, ship before payments | `Gift` model, `gifts.controller.ts`, `gifts/[giftId]/page.tsx` |
| **7** | Stripe payments + `/pricing` page + Stripe webhook handler + credit top-up flow | `payments.controller.ts`, `payments.service.ts`, `pricing/page.tsx` |
| **8** | Multi-theme batch (select 3) + photo guidance UI + post-gen quality warnings | `PortraitUploadStep.tsx`, `ThemeGrid.tsx` (multi-select) |
| **9** | `/themes` discovery page + trending + quality scoring per theme + validate print demand ("Coming soon" button + click tracking) | `themes/page.tsx`, `ThemeCard.tsx` (hover gallery), quality score tracking |
| **10** | Public `/gallery` + SEO pages + opt-in consent toggle + admin analytics + Gelato print (if Sprint 9 click data justifies it) | `gallery/page.tsx`, `dashboard/admin/page.tsx`, Redis analytics flush |

---

## Environment Variables — Complete Reference

```bash
# ── Existing ──────────────────────────────────────────────
DATABASE_URL=postgresql://picflow:picflow@localhost:5432/picflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-north-1
AWS_S3_BUCKET=
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3001

# ── Phase 1 (AI + Email + Moderation) ────────────────────
REPLICATE_API_TOKEN=
REPLICATE_WEBHOOK_SECRET=   # random string — appended to webhook URL for HMAC verify
RESEND_API_KEY=             # email notifications via Resend

# ── Phase 3 (Payments) ────────────────────────────────────
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# ── Phase 4 (Print) ───────────────────────────────────────
GELATO_API_KEY=
```

---

*Last updated: 2026-04-14*
