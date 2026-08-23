import prisma from "@/utils/connect";
import { searchWithBM25 } from "@/utils/search";

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "as", "by", "with", "from", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "i", "you", "he", "she", "it", "we",
  "they", "me", "him", "her", "us", "them", "my", "your", "his", "its", "our",
  "their", "this", "that", "these", "those", "am", "not", "no", "nor", "so",
  "if", "then", "than", "too", "very", "just", "about", "into", "over", "after",
  "before", "between", "under", "again", "further", "once", "here", "there",
  "when", "where", "why", "how", "all", "each", "few", "more", "most", "other",
  "some", "such", "only", "own", "same", "also", "like", "our", "out", "up",
]);

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
};

/**
 * Focused BM25 query: meaningful terms only.
 * Raw long HTML queries produced negative IDF-dominated scores in small corpora.
 */
const buildBm25Query = (title, desc) => {
  const raw = `${title || ""} ${stripHtml(desc).slice(0, 500)}`;
  const terms = raw
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
  return [...new Set(terms)].slice(0, 24).join(" ");
};

const postSelect = {
  id: true,
  slug: true,
  title: true,
  desc: true,
  img: true,
  views: true,
  catSlug: true,
  userEmail: true,
  createdAt: true,
  user: {
    select: {
      name: true,
      username: true,
      image: true,
      email: true,
    },
  },
};

/** Drop broken / unusable recommendation targets. */
function isUsablePost(post) {
  return Boolean(post?.slug && post?.title && String(post.title).trim());
}

/**
 * Slugs the user has completed (always skip) or viewed (skip when alternatives exist).
 */
async function getProgressSets(userEmail) {
  if (!userEmail) {
    return { completed: new Set(), viewed: new Set() };
  }

  const rows = await prisma.userPostProgress.findMany({
    where: { userEmail },
    select: { postSlug: true, status: true },
  });

  const completed = new Set();
  const viewed = new Set();
  for (const row of rows) {
    if (row.status === "completed") completed.add(row.postSlug);
    if (row.status === "viewed") viewed.add(row.postSlug);
  }
  return { completed, viewed };
}

function isExcluded(slug, completed, viewed, allowViewed) {
  if (completed.has(slug)) return true;
  if (!allowViewed && viewed.has(slug)) return true;
  return false;
}

function pickFromPool(posts, completed, viewed) {
  const usable = posts.filter(isUsablePost);
  return (
    usable.find((p) => !isExcluded(p.slug, completed, viewed, false)) ||
    usable.find((p) => !isExcluded(p.slug, completed, viewed, true)) ||
    null
  );
}

async function findExplicitNext(fromSlug, completed, viewed) {
  const relations = await prisma.articleRelation.findMany({
    where: { fromSlug, type: "next" },
    include: { toPost: { select: postSelect } },
  });

  // Ignore dangling relations (deleted / missing posts)
  const valid = relations.filter((r) => isUsablePost(r.toPost));

  const preferUnread = valid.find(
    (r) => !isExcluded(r.toSlug, completed, viewed, false)
  );
  if (preferUnread?.toPost) {
    return {
      post: preferUnread.toPost,
      reason: "Next in your learning path",
      source: "explicit",
    };
  }

  const allowViewed = valid.find(
    (r) => !isExcluded(r.toSlug, completed, viewed, true)
  );
  if (allowViewed?.toPost) {
    return {
      post: allowViewed.toPost,
      reason: "Next in your learning path",
      source: "explicit",
    };
  }

  return null;
}

function rankWithBm25(pool, queryText, conceptPeerSlugs) {
  if (!pool.length || !queryText) return null;

  // Allow relative ranking even when IDF yields negative absolute scores
  let ranked = searchWithBM25(pool, queryText, {
    minScore: -999,
    maxResults: 15,
  });

  if (ranked.length === 0) {
    const titleBits = queryText.split(/\s+/).slice(0, 8).join(" ");
    ranked = searchWithBM25(pool, titleBits, {
      minScore: -999,
      maxResults: 15,
    });
  }

  if (ranked.length === 0) return null;

  const topSlice = ranked.slice(0, 5);
  const top =
    topSlice.find((r) => conceptPeerSlugs.has(r.slug)) || ranked[0];

  if (!isUsablePost(top)) return null;

  const { tokens, searchText, score, ...post } = top;
  return {
    post,
    reason: conceptPeerSlugs.has(post.slug)
      ? "Related through shared concepts"
      : "Most relevant to what you just read",
    source: "bm25",
    score,
  };
}

async function findBm25Next(current, completed, viewed) {
  const currentConcepts = await prisma.postConcept.findMany({
    where: { postSlug: current.slug },
    select: { conceptSlug: true },
  });
  const conceptSlugs = currentConcepts.map((c) => c.conceptSlug);

  let conceptPeerSlugs = new Set();
  if (conceptSlugs.length > 0) {
    const peers = await prisma.postConcept.findMany({
      where: {
        conceptSlug: { in: conceptSlugs },
        postSlug: { not: current.slug },
      },
      select: { postSlug: true },
    });
    conceptPeerSlugs = new Set(peers.map((p) => p.postSlug));
  }

  // Primary pool: same category + concept peers
  const primary = await prisma.post.findMany({
    where: {
      slug: { not: current.slug },
      OR: [
        { catSlug: current.catSlug },
        ...(conceptPeerSlugs.size
          ? [{ slug: { in: [...conceptPeerSlugs] } }]
          : []),
      ],
    },
    select: postSelect,
    take: 150,
    orderBy: { createdAt: "desc" },
  });

  const filterPool = (candidates) => {
    const eligible = candidates.filter(
      (p) => isUsablePost(p) && !isExcluded(p.slug, completed, viewed, false)
    );
    if (eligible.length > 0) return eligible;
    return candidates.filter(
      (p) => isUsablePost(p) && !isExcluded(p.slug, completed, viewed, true)
    );
  };

  const queryText = buildBm25Query(current.title, current.desc);
  const primaryPool = filterPool(primary);
  let hit = rankWithBm25(primaryPool, queryText, conceptPeerSlugs);
  if (hit) return hit;

  // Wider pool: recent posts across categories (helps new / sparsely tagged articles)
  const global = await prisma.post.findMany({
    where: { slug: { not: current.slug } },
    select: postSelect,
    take: 100,
    orderBy: { createdAt: "desc" },
  });
  const globalPool = filterPool(global);
  hit = rankWithBm25(globalPool, queryText, conceptPeerSlugs);
  if (hit) return hit;

  return null;
}

async function findCategoryFallback(current, completed, viewed) {
  const posts = await prisma.post.findMany({
    where: {
      catSlug: current.catSlug,
      slug: { not: current.slug },
    },
    select: postSelect,
    orderBy: [{ createdAt: "desc" }],
    take: 30,
  });

  const pick = pickFromPool(posts, completed, viewed);
  if (!pick) return null;

  return {
    post: pick,
    reason: `More in ${current.catSlug}`,
    source: "category",
  };
}

/**
 * Hybrid next-article resolution (Decision C):
 * explicit unread next → BM25 → same-category recent.
 */
export async function resolveNextArticle(slug, userEmail = null) {
  const current = await prisma.post.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      desc: true,
      catSlug: true,
    },
  });

  if (!current || !isUsablePost(current)) {
    return { error: "not_found" };
  }

  const { completed, viewed } = await getProgressSets(userEmail);

  const explicit = await findExplicitNext(slug, completed, viewed);
  if (explicit) return explicit;

  const bm25 = await findBm25Next(current, completed, viewed);
  if (bm25) return bm25;

  const fallback = await findCategoryFallback(current, completed, viewed);
  if (fallback) return fallback;

  return { post: null, reason: null, source: null };
}

/**
 * Upsert reading progress for a signed-in user.
 * status: "viewed" | "completed"
 * completed never downgrades to viewed.
 */
export async function upsertPostProgress(userEmail, postSlug, status) {
  if (!["viewed", "completed"].includes(status)) {
    throw new Error("Invalid status");
  }

  const existing = await prisma.userPostProgress.findUnique({
    where: {
      userEmail_postSlug: { userEmail, postSlug },
    },
  });

  if (existing?.status === "completed" && status === "viewed") {
    return existing;
  }

  return prisma.userPostProgress.upsert({
    where: {
      userEmail_postSlug: { userEmail, postSlug },
    },
    create: { userEmail, postSlug, status },
    update: { status },
  });
}
