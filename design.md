# PixelPen Design

Last updated: 2026-08-22

## Product direction

PixelPen evolves from a generic blogging platform into:

**An AI-assisted publishing and learning platform where high-quality human-written articles are connected into structured learning paths, and readers are guided toward what they should learn next.**

### Principle

**HUMAN-WRITTEN CONTENT > AI-GENERATED CONTENT.**

AI assists writers and readers; it does not replace human authorship.

Long-term differentiation:

```
ARTICLE → CONCEPTS → PREREQUISITES → KNOWLEDGE GRAPH → PERSONALIZED NEXT ARTICLE
```

Immediate goal (MVP): prove that after finishing an article, PixelPen recommends a genuinely useful next article and the reader voluntarily continues.

Immediate goal is **not** recommendation ML.

---

## Current system (as built)

### Stack

- Next.js 14 (App Router) + React
- MongoDB + Prisma
- NextAuth (Google / GitHub / Facebook)
- Firebase Storage (images)
- Upstash Redis (optional cache + view counters)
- xAI (summarize + article chat)
- TipTap editor

### High-level flow

```
OAuth → User
Write (TipTap + Firebase media) → Post in MongoDB
Read /posts/[slug] → HTML body + comments + sidebar (AI + popular posts)
Search (BM25) / Categories / Profiles
```

### Organization conventions (preserve)

| Kind | Location |
|------|----------|
| Pages | `src/app/...` |
| Components | `src/components/<name>/` |
| API routes | `src/app/api/.../route.js` |
| DB / auth / search / firebase | `src/utils/` |
| Cache / views | `src/lib/` |

### Existing data model (relevant)

- `User` ← `Post` (via `userEmail`)
- `Category` ← `Post` (via `catSlug`)
- `Post` ← `Comment` (via `postSlug`)
- Post fields: `slug`, `title`, `desc` (HTML), `img`, `views`, `catSlug`, `userEmail`, `createdAt`

Categories (`style`, `fashion`, `food`, `travel`, `culture`, `coding`) are coarse topics, **not** learning concepts.

### Existing reader AI (keep)

- Summarize: `POST /api/summarize`
- Article chat: `POST /api/chat` (grounded in current article only)
- UI entry: sidebar `Menu` → `SummarizeButton` / `ChatBot`

---

## Learning MVP (intended design)

Status: **Learning MVP complete (Phases 0–4, 6–7; Phase 5 skipped).** Hybrid next + Continue learning live. See `progress.md`.

### Target loop

```
Reader finishes Article A
  → PixelPen shows one “Continue learning” recommendation (Article B)
  → Short human-readable reason
  → Prefer unread/incomplete for signed-in users (UserPostProgress)
  → Reader clicks → Article B
```

### Locked choices

| Topic | Choice |
|-------|--------|
| Relationships | Explicit `ArticleRelation` **overrides**; concept graph as **fallback** |
| Concept capture | Manual seed only (no write-page tagging in MVP) |
| CTA | End of article, before comments |
| Personalization | `UserPostProgress` (`viewed` \| `completed`) |

### Learning data model (Phase 1)

```
Concept ←→ PostConcept ←→ Post
Concept ← ConceptPrereq → Concept (prerequisiteSlug)
Post ← ArticleRelation → Post  (type: "next" | "prerequisite")
User ← UserPostProgress → Post (status: "viewed" | "completed")
```

### Seeded path (Phase 2)

Manual seed via `npm run seed:learning` (`scripts/seed-learning-path.js`).

**Explicit next chain:**

1. `dont-just-leetcode-follow-the-coding-patterns-instead` — Coding Patterns  
2. `system-design-interview-design-whatsapp` — System Design  
3. `inside-an-ai-mind-learning-from-on-the-biology-of-a-large-language-model` — LLM Fundamentals  
4. `how-can-organizations-think-differently-to-get-the-most-out-of-ai` — Applied AI  

**Concepts:** `coding-patterns` → `system-design` / `llm-fundamentals` → `applied-ai` (via `ConceptPrereq`).

**Next resolution order (API, Phase 3) — Decision C hybrid:**

1. Explicit `ArticleRelation` (`type: "next"`) if target not completed (prefer unread over viewed)
2. Else **BM25** over same-category / concept-peer candidates (reuse `searchWithBM25`) — surfaces newly uploaded articles
3. Else same-category recent fallback
4. Signed-in: skip via `UserPostProgress` (`completed` always; `viewed` when alternatives exist)

Endpoints:

- `GET /api/posts/[slug]/next` → `{ post, reason, source }` (`source`: `explicit` | `bm25` | `category`)
- `POST /api/posts/[slug]/progress` → `{ status: "viewed" | "completed" }` (auth required)

Core logic: `src/utils/learningNext.js`

### Implementation pieces

1. **Data** — schema ✅ Phase 1  
2. **Seed** — curated chain ✅ Phase 2  
3. **API** — hybrid next + progress ✅ Phase 3  
4. **UI** — `ContinueLearning` after article HTML, before comments ✅ Phase 4  
5. **Writer tagging** — skipped (Q2=A)

### Non-goals (MVP)

- AI-generated / auto-published articles
- Collaborative filtering or ranking models
- Full knowledge-graph explorer UI
- Rewriting the app architecture
- Coupling to the separate cron auto-publisher repo
- Unrelated refactors

### Reuse (planned)

- `prisma` via `@/utils/connect`
- `getCachedData` / `clearCache` from `@/lib/cache`
- `Card` for recommendation display
- Post page + existing component folder conventions
- Keep summarize/chat unchanged

---

## Docs map

| File | Purpose |
|------|---------|
| `design.md` | Intended system design (this file) |
| `decisions.md` | Important product/architecture decisions |
| `progress.md` | **Single tracker** for phases, status, and what’s done/next |

When architecture changes, update this file and log the decision in `decisions.md`.
