# PixelPen Learning MVP — Progress Tracker

**Single source of truth for implementation status.**  
Update this file at the start/end of every phase. Do not scatter status across chats.

Last updated: 2026-08-23

---

## Current status

| Item | Value |
|------|--------|
| Active phase | **Complete** (Phases 0–4, 6–7; 5 skipped) |
| Phase 0–4 | ✅ Done |
| Phase 5 | ⏭️ Skipped (Q2=A) |
| Phase 6 | ✅ Done |
| Phase 7 | ✅ Done |
| Ranking | ✅ Hybrid C (explicit → BM25 → category) |
| Next action | Use in production; reopen Phase 5 only if writers should tag concepts |

---

## Phase checklist

### Phase 0–4 ✅
### Phase 5 ⏭️ Skipped
### Phase 6 ✅

### Phase 7 — Hardening ✅

- [x] Tune BM25: stopword-cleaned query, relative scores (`minScore: -999`), wider candidate pool
- [x] Anonymous next cache (`learning:next:anon:{slug}`, TTL 120s) + seed script cache clear
- [x] Empty/fallback polish: loading skeleton; hide if no usable post
- [x] Exclude broken targets (`isUsablePost`; dangling `ArticleRelation` ignored)

**Re-verified after hardening:**

| From | Source | Next |
|------|--------|------|
| LeetCode patterns | `explicit` | WhatsApp system design |
| Summer travel guide | `bm25` | Darjeeling getaway |
| Churn models | `bm25` | Inside an AI Mind |

**Status:** ✅ Done

---

## Explicit non-goals

- Embedding / vector DB / collaborative filtering
- AI selecting the next article
- Cron publisher coupling
- Write-page concept tagging

---

## Change log

| Date | Change |
|------|--------|
| 2026-08-22 | Phase 0–4: docs, schema, seed, hybrid API, ContinueLearning UI |
| 2026-08-23 | Phase 6 QA verified |
| 2026-08-23 | Phase 7: BM25 tuning, usable-post guards, anon cache, UI skeleton |
