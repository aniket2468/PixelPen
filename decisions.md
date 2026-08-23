# PixelPen Decisions

Important product, architecture, schema, ranking, UX, or infrastructure decisions only.

Template:

```
Decision
Date
Context
Options considered
Decision made
Why
Tradeoffs
Consequences
```

---

## Decision log

---

### Next-article ranking: hybrid (explicit + BM25)

**Decision**  
Use hybrid resolution for Continue learning instead of explicit-only chains.

**Date**  
2026-08-22

**Context**  
Static `ArticleRelation` next links do not surface newly uploaded articles. Owner rejected pure rule-only scaling and chose option C from the ranking quiz.

**Options considered**  
A. Explicit links only  
B. Pure BM25 content similarity  
C. Hybrid: explicit next (if unread) → BM25 → category fallback  
D. Embeddings / vector similarity  

**Decision made**  
**C**

**Why**  
Keeps curated learning paths when seeded; reuses existing BM25 (`src/utils/search.js`) so new posts become eligible without ML infra or vector DB.

**Tradeoffs**  
BM25 optimizes topical similarity, not guaranteed pedagogical “next step.” Explicit overrides mitigate that for important chains. Slightly more API logic than B.

**Consequences**  
Phase 3 API order: (1) unread explicit `next`, (2) BM25 over other posts (prefer shared concepts / same category), (3) same-category recent fallback; always honor `UserPostProgress` for signed-in users. Update `design.md` accordingly.

---

### Learning MVP quiz answers

**Decision**  
Lock MVP product choices for relationships, concept capture, CTA placement, and personalization.

**Date**  
2026-08-22

**Context**  
Inspection posed Q1–Q4 before any learning schema/API/UI. Owner answered `1C 2A 3A 4C`.

**Options considered**  
See prior quiz in Phase 0 inspection.

**Decision made**

| # | Topic | Choice |
|---|--------|--------|
| Q1 | Relationships | **C** — Both explicit article→article and concept graph (explicit overrides; concepts as fallback) |
| Q2 | Concept capture | **A** — Manual seed only for MVP (no write-page / AI tagging yet) |
| Q3 | CTA placement | **A** — End of article body, before comments |
| Q4 | Personalization | **C** — `UserPostProgress`; prefer unread / incomplete next |

**Why**  
C gives curated quality now plus a path to structured learning. Manual seed keeps Phase 2 fast and human-authored. End-of-article CTA matches “I finished → what’s next.” Progress tracking makes “next” meaningfully personalized without ML.

**Tradeoffs**  
More schema than pure explicit links; progress requires auth-aware next API and write path for viewed/completed. Manual seeding doesn’t scale—acceptable for MVP proof.

**Consequences**  
- Phase 1 schema includes: `Concept`, `PostConcept`, `ConceptPrereq`, `ArticleRelation`, `UserPostProgress`  
- Phase 5 (writer tagging) **skipped** for MVP  
- Phase 3–4 must honor progress when session exists  
- Phase 4 UI mounts after article HTML, before comments  

---

### Docs scaffolding for learning work

**Decision**  
Create `design.md`, `decisions.md`, and `progress.md` at repo root before any schema/UI code.

**Date**  
2026-08-22

**Context**  
Learning-path MVP needs a durable design record, a decision log, and one phase tracker so work across phases stays clear. Files did not exist.

**Options considered**  
A. Only README updates  
B. design.md + decisions.md only  
C. design.md + decisions.md + progress.md (single implementation tracker)

**Decision made**  
C

**Why**  
Separating design vs decisions avoids mixing status with rationale; one progress file is the operational source of truth for “what’s done / what’s next.”

**Tradeoffs**  
Three files to maintain vs one mega-doc. Slight overhead; clearer ownership.

**Consequences**  
Phase 0 complete. Phase 1+ unblocked after quiz answers logged.
